/**
 * Standalone "migrate to the new SpaceBudz collection" (Wormhole) flow.
 *
 * Port of Contract.migrate() from vendor/@spacebudz/wormhole to Lucid Evolution, see
 * legacyShared.ts for why (cost models). The contract and its data are reused 1:1:
 * the scripts, the merkle data and the metadata come from the vendored package, and the
 * derived lock address / policy id are checked against the constants in config.ts.
 *
 * Do not change how the datums are encoded: their hashes are leaves of the merkle tree that
 * is baked into the minting policy.
 */
import { sha256 } from "@noble/hashes/sha256";
import { baseUrl, projectId } from "../../api";
import { DEPRECATED_POLICY_ID, LOCK_ADRESS, POLICY_ID } from "../../config";
import { loadLucid, unwrapError } from "./legacyShared";

// The twin SpaceBudz: their 'reference' NFT is minted with label 1 instead of 100
const TWINS = [1903, 6413];
const isTwin = (id: number) => TWINS.includes(id);

export type LegacyMigration = { txHash: string; ids: number[] };

// ---------------------------------------------------------------- contract data (lazy)

const loadWormholeData = () =>
  Promise.all([
    import(
      /* webpackChunkName: "legacy-migrate" */ "../../../vendor/@spacebudz/wormhole/esm/src/data/metadata.js"
    ),
    import(
      /* webpackChunkName: "legacy-migrate" */ "../../../vendor/@spacebudz/wormhole/esm/src/data/merkletree_data.js"
    ),
    import(
      /* webpackChunkName: "legacy-migrate" */ "../../../vendor/@spacebudz/wormhole/esm/src/ghc/scripts.js"
    ),
    import(
      /* webpackChunkName: "legacy-migrate" */ "../../../vendor/@spacebudz/wormhole/esm/src/config.js"
    ),
  ]);

// Merkle tree, same algorithm as MerkleTree in lucid-cardano@0.10.9 (the policy's root hash
// is checked below, so a mistake here can not go unnoticed).
type MerkleNode = {
  node: Uint8Array;
  left: MerkleNode | null;
  right: MerkleNode | null;
};
const concat = (a: Uint8Array, b: Uint8Array) => {
  const r = new Uint8Array(a.length + b.length);
  r.set(a);
  r.set(b, a.length);
  return r;
};
const equal = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((x, i) => x === b[i]);
const buildTree = (hashes: Uint8Array[]): MerkleNode => {
  if (hashes.length === 1) return { node: hashes[0], left: null, right: null };
  const cutoff = Math.floor(hashes.length / 2);
  const left = buildTree(hashes.slice(0, cutoff));
  const right = buildTree(hashes.slice(cutoff));
  return { node: sha256(concat(left.node, right.node)), left, right };
};
type ProofStep = { left?: Uint8Array; right?: Uint8Array };
const getProof = (root: MerkleNode, data: Uint8Array): ProofStep[] => {
  const hash = sha256(data);
  const proof: ProofStep[] = [];
  const search = (tree: MerkleNode | null): boolean => {
    if (tree && equal(tree.node, hash)) return true;
    if (tree && tree.right && search(tree.left)) {
      proof.push({ right: tree.right.node });
      return true;
    }
    if (tree && tree.left && search(tree.right)) {
      proof.push({ left: tree.left.node });
      return true;
    }
    return false;
  };
  search(root);
  return proof;
};

// Datum of a reference NFT: Constr 0 [metadata map, 1, Constr 0 []], encoded exactly like the
// original code did (lucid-cardano 0.10.9 Data.fromJson + Data.to): map keys in insertion
// order, definite-length maps, indefinite-length lists, byte strings > 64 bytes in 64 byte
// chunks, "0x…" strings as raw bytes. Lucid Evolution sorts map keys, which would change the
// datum (and its hash), so this is done by hand. Verified against all 10000 merkle leaves.
const cborHead = (major: number, n: number): number[] => {
  const mt = major << 5;
  if (n < 24) return [mt | n];
  if (n < 256) return [mt | 24, n];
  if (n < 65536) return [mt | 25, n >> 8, n & 255];
  return [mt | 26, (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
};
const textEncoder = new TextEncoder();
const cborBytes = (b: Uint8Array): number[] => {
  if (b.length <= 64) return [...cborHead(2, b.length), ...Array.from(b)];
  const out = [0x5f];
  for (let i = 0; i < b.length; i += 64) {
    const chunk = b.slice(i, i + 64);
    out.push(...cborHead(2, chunk.length), ...Array.from(chunk));
  }
  out.push(0xff);
  return out;
};
const jsonToBytes = (s: string): Uint8Array =>
  s.startsWith("0x")
    ? Uint8Array.from(Buffer.from(s.slice(2), "hex"))
    : textEncoder.encode(s);
const cborJson = (v: any): number[] => {
  if (typeof v === "string") return cborBytes(jsonToBytes(v));
  if (Array.isArray(v))
    return v.length === 0 ? [0x80] : [0x9f, ...v.flatMap(cborJson), 0xff];
  if (v && typeof v === "object") {
    const entries = Object.entries(v);
    return [
      ...cborHead(5, entries.length),
      ...entries.flatMap(([k, x]) => [
        ...cborBytes(textEncoder.encode(k)),
        ...cborJson(x),
      ]),
    ];
  }
  throw new Error("Unsupported metadata value.");
};
const metadataDatum = (metadata: any): string =>
  Buffer.from([
    0xd8, 0x79, 0x9f, ...cborJson(metadata), 0x01, 0xd8, 0x79, 0x80, 0xff,
  ]).toString("hex");

type Context = {
  refAddress: string;
  lockAddress: string;
  policyId: string;
  deployTxHash: string;
  leaves: Uint8Array[];
  tree: MerkleNode;
  metadata: any[];
  Action: any;
};

let contextPromise: Promise<Context> | undefined;
const getContext = (): Promise<Context> => {
  if (!contextPromise) contextPromise = createContext();
  return contextPromise;
};

const createContext = async (): Promise<Context> => {
  const LE = await loadLucid();
  const [metadataModule, merkleModule, scriptsModule, configModule] =
    await loadWormholeData();
  const metadata: any[] = metadataModule.default;
  const scripts: any = scriptsModule.default;
  const { budConfig } = configModule;
  const {
    Data,
    applyParamsToScript,
    validatorToAddress,
    validatorToScriptHash,
    mintingPolicyToId,
    toLabel,
    fromText,
    toHex,
    fromHex,
  } = LE;

  // Schemas, same as vendor/@spacebudz/wormhole/esm/src/contract.types.js
  const Bytes4 = Data.Bytes({ minLength: 4, maxLength: 4 });
  const Bytes28 = Data.Bytes({ minLength: 28, maxLength: 28 });
  const Hash = Data.Object({
    hash: Data.Bytes({ minLength: 32, maxLength: 32 }),
  });
  const OutRef = Data.Object({
    txHash: Hash,
    outputIndex: Data.Integer(),
  });
  const DetailsParams = Data.Tuple([
    Bytes4,
    Data.Object({
      extraOref: OutRef,
      royaltyName: Data.Bytes(),
      ipName: Data.Bytes(),
      oldPolicyId: Bytes28,
      merkleRoot: Hash,
      refAddress: Bytes28,
      lockAddress: Bytes28,
      nonce: Data.Integer(),
    }),
  ]);
  const RefParams = Data.Tuple([Bytes4, Bytes4, Bytes4]);
  const LockParams = Data.Tuple([Bytes4, Bytes4, Bytes4, Bytes28]);
  const Proof = Data.Array(
    Data.Enum([
      Data.Object({ Left: Data.Tuple([Hash]) }),
      Data.Object({ Right: Data.Tuple([Hash]) }),
    ])
  );
  const Action = Data.Enum([
    Data.Object({ Mint: Data.Tuple([Data.Array(Proof)]) }),
    Data.Literal("Burn"),
    Data.Literal("MintExtra"),
  ]);

  const leaves: Uint8Array[] = merkleModule.default.map((d: string) =>
    fromHex(d)
  );
  const tree = buildTree(leaves.map((d) => sha256(d)));

  const referenceValidator = {
    type: "PlutusV2",
    script: applyParamsToScript(
      scripts.reference,
      [toLabel(1), toLabel(100), toLabel(222)],
      RefParams
    ),
  };
  const lockValidator = {
    type: "PlutusV2",
    script: applyParamsToScript(
      scripts.lock,
      [toLabel(1), toLabel(100), toLabel(222), budConfig.oldPolicyId],
      LockParams
    ),
  };
  const mintPolicy = {
    type: "PlutusV2",
    script: applyParamsToScript(
      scripts.mint,
      [
        toLabel(100),
        {
          extraOref: {
            txHash: { hash: budConfig.extra.outRef.txHash },
            outputIndex: BigInt(budConfig.extra.outRef.outputIndex),
          },
          royaltyName: toLabel(500) + fromText("Royalty"),
          ipName: toLabel(600) + fromText("Ip"),
          oldPolicyId: budConfig.oldPolicyId,
          merkleRoot: { hash: toHex(tree.node) },
          refAddress: validatorToScriptHash(referenceValidator),
          lockAddress: validatorToScriptHash(lockValidator),
          nonce: 23321n,
        },
      ],
      DetailsParams
    ),
  };

  const policyId: string = mintingPolicyToId(mintPolicy);
  const lockAddress: string = validatorToAddress("Mainnet", lockValidator);
  // Safety net: if anything in the derivation is off, the policy / address won't match
  if (policyId !== POLICY_ID || lockAddress !== LOCK_ADRESS)
    throw new Error(
      "The wormhole contract does not match the expected policy id / lock address."
    );

  return {
    refAddress: validatorToAddress("Mainnet", referenceValidator),
    lockAddress,
    policyId,
    deployTxHash: budConfig.deployTxHash,
    leaves,
    tree,
    metadata,
    Action,
  };
};

// ---------------------------------------------------------------- migration

const isSizeOrBudgetError = (e: any): boolean => {
  const err = unwrapError(e);
  const message = String((err && err.message) || err || "");
  return /EvaluateTransaction fails|EvaluationFailure|maximum|too large|exceeded/i.test(
    message
  );
};

/**
 * Migrates old SpaceBudz (the ones in the connected wallet) to the new collection.
 * More than ~7 per transaction don't fit, so if the tx is too big or too expensive it is
 * rebuilt with one SpaceBud less until it fits. Returns the tx hash and the ids that were
 * actually migrated. Nothing is asked from the wallet before a valid tx exists.
 */
export const migrateLegacy = async (
  walletApi: any,
  ids: number[]
): Promise<LegacyMigration> => {
  const LE = await loadLucid();
  const { Lucid, Blockfrost, Data, CML, toUnit, fromText, toHex } = LE;

  const run = async (): Promise<LegacyMigration> => {
    const ctx = await getContext();

    const lucid = await Lucid(new Blockfrost(baseUrl, projectId), "Mainnet");
    lucid.selectWallet.fromAPI(walletApi);

    // Only SpaceBudz that are really in the wallet can be migrated (listed ones are not)
    const held = new Set<string>();
    (await lucid.wallet().getUtxos()).forEach((utxo: any) =>
      Object.keys(utxo.assets).forEach((unit) => held.add(unit))
    );
    const candidates = Array.from(new Set(ids)).filter(
      (id) =>
        Number.isInteger(id) &&
        id >= 0 &&
        id < ctx.leaves.length &&
        held.has(toUnit(DEPRECATED_POLICY_ID, fromText(`SpaceBud${id}`)))
    );
    if (candidates.length === 0)
      throw new Error(
        ids.length === 1
          ? `SpaceBud #${ids[0]} is not in your wallet. If it is listed, cancel the listing first.`
          : "None of these SpaceBudz are in your wallet. If they are listed, cancel the listings first."
      );

    const [refScript] = await lucid.utxosByOutRef([
      { txHash: ctx.deployTxHash, outputIndex: 0 },
    ]);
    if (!refScript) throw new Error("Wormhole script reference not found.");

    let changeAddress: string | undefined;
    try {
      changeAddress = CML.Address.from_hex(
        await walletApi.getChangeAddress()
      ).to_bech32(undefined);
    } catch (e) {}

    const refUnit = (id: number) =>
      toUnit(ctx.policyId, fromText(`Bud${id}`), isTwin(id) ? 1 : 100);

    const build = (subset: number[]) => {
      // Order is important since the contract relies on this: the ids sorted as strings, in
      // descending order (the default sort() compares numbers as strings)
      const orderedIds = subset.slice().sort().reverse();
      const proofs = orderedIds.map((id) =>
        getProof(ctx.tree, ctx.leaves[id])
      );
      const action = Data.to(
        {
          Mint: [
            proofs.map((proof) =>
              proof.map((step) =>
                step.left
                  ? { Left: [{ hash: toHex(step.left) }] }
                  : { Right: [{ hash: toHex(step.right) }] }
              )
            ),
          ],
        },
        ctx.Action
      );
      const mintAssets: Record<string, bigint> = {};
      const lockAssets: Record<string, bigint> = {};
      orderedIds.forEach((id) => {
        mintAssets[refUnit(id)] = 1n;
        mintAssets[toUnit(ctx.policyId, fromText(`Bud${id}`), 222)] = 1n;
        lockAssets[toUnit(DEPRECATED_POLICY_ID, fromText(`SpaceBud${id}`))] =
          1n;
      });

      let tx = lucid.newTx().mintAssets(mintAssets, action);
      orderedIds.forEach((id) => {
        // Datum as hash (datum in the witness set), the policy checks the hash
        tx = tx.pay.ToContract(
          ctx.refAddress,
          { kind: "asHash", value: metadataDatum(ctx.metadata[id]) },
          { [refUnit(id)]: 1n }
        );
      });
      return tx.pay
        .ToContract(
          ctx.lockAddress,
          { kind: "inline", value: Data.to(ctx.policyId, Data.Bytes()) },
          lockAssets
        )
        .readFrom([refScript])
        .complete({ localUPLCEval: false, changeAddress });
    };

    for (let n = candidates.length; n >= 1; n--) {
      const subset = candidates.slice(0, n);
      let tx: any;
      try {
        tx = await build(subset);
      } catch (e) {
        if (n > 1 && isSizeOrBudgetError(e)) continue;
        throw e;
      }
      const signed = await tx.sign.withWallet().complete();
      return { txHash: await signed.submit(), ids: subset };
    }
    throw new Error("The SpaceBudz could not be migrated.");
  };

  try {
    return await run();
  } catch (e) {
    throw unwrapError(e);
  }
};
