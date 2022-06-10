import {
  addWitnessToMultisigSession,
  baseUrl,
  createMultisigSession,
  getMultisigSession,
  projectId,
} from "../../api";
import { getSelectedWallet, toHex } from "../../utils";
import { Blockfrost, C, fromHex, Lucid, Tx, TxComplete } from "lucid-cardano";

typeof window !== "undefined" &&
  (await Lucid.initialize(new Blockfrost(baseUrl, projectId), "Mainnet"));

type MultiSig = {
  script: string;
  address: string;
};

const coSigners = [
  "d52e11f3e48436dd42dbec6d88c239732e503b8b7a32af58e5f87625",
  "2b460b47836d9dd1bda529872e493a657a08486a6c93f424f90f0cbe",
  "1a2512fe8ca23d60a04276888ca3c1754e9a47ab26ef050459887e1f",
  "a0ae344dc1d71200347bd6304195b1807961f206505f51ff9a83cdf3",
  "1447eed2459229d971a4681351e0936f4b7e5b48da9cc5c8384850b8",
  "a4e16597fe0242865c7b86bc2c597b8b09a69ceaedea6193779b168d",
];

export const createMultisig = (): MultiSig => {
  const coSignersScripts = C.NativeScripts.new();
  coSigners.forEach((coSigner) => {
    coSignersScripts.add(
      C.NativeScript.new_script_pubkey(
        C.ScriptPubkey.new(
          C.Ed25519KeyHash.from_bytes(Buffer.from(coSigner, "hex"))
        )
      )
    );
  });

  const multisig = C.NativeScript.new_script_n_of_k(
    C.ScriptNOfK.new(3, coSignersScripts)
  );

  const address = C.BaseAddress.new(
    C.NetworkInfo.mainnet().network_id(),
    C.StakeCredential.from_scripthash(
      multisig.hash(C.ScriptHashNamespace.NativeScript)
    ),
    C.StakeCredential.from_scripthash(
      multisig.hash(C.ScriptHashNamespace.NativeScript)
    )
  )
    .to_address()
    .to_bech32();

  return {
    script: toHex(multisig.to_bytes()),
    address,
  };
};

export type Recipient = { address: string; amount: BigInt };

export const createTransaction = async (
  recipients: Recipient[],
  message: string
): Promise<string> => {
  const multisig = createMultisig();
  await Lucid.selectWalletFromUtxos({ address: multisig.address });

  const tx = Tx.new();
  recipients.forEach((recipient) => {
    tx.payToAddress(recipient.address, { lovelace: recipient.amount });
  });
  tx.attachMetadata(674, { msg: chunkSubstr(message, 64) });
  tx.validTo(Date.now() + 256000000000);
  tx.attachSpendingValidator({
    type: "Native",
    script: multisig.script,
  });

  const txComplete = await tx.complete();

  const txHex = toHex(txComplete.txComplete.to_bytes());
  const session = await createMultisigSession(txHex);

  return session;
};

type Action = "Signed" | { Submitted: string } | undefined;

export const signTransaction = async (
  session: string,
  tx: string
): Promise<Action> => {
  const selectedWallet = await getSelectedWallet();
  await Lucid.selectWallet((selectedWallet as any).walletName);

  const txComplete = new TxComplete(C.Transaction.from_bytes(fromHex(tx)));

  const witness = await txComplete.partialSign().catch((e) => {
    throw new Error("Transaction signature refused");
  });

  const parsedWitness = C.TransactionWitnessSet.from_bytes(fromHex(witness));

  const { witnesses } = await getMultisigSession(session);

  const parsedWitnesses = witnesses.map((w) =>
    C.TransactionWitnessSet.from_bytes(Buffer.from(w, "hex"))
  );

  if (parsedWitness.vkeys().len() <= 0)
    throw new Error("Transaction could not be signed");

  if (
    parsedWitnesses.some(
      (w) =>
        Buffer.from(
          w.vkeys().get(0).vkey().public_key().hash().to_bytes()
        ).toString("hex") ===
        Buffer.from(
          parsedWitness.vkeys().get(0).vkey().public_key().hash().to_bytes()
        ).toString("hex")
    )
  )
    throw new Error("Transaction already signed");

  if (
    !coSigners.some(
      (cosigner) =>
        cosigner ===
        Buffer.from(
          parsedWitness.vkeys().get(0).vkey().public_key().hash().to_bytes()
        ).toString("hex")
    )
  )
    throw new Error("Transaction signed by invalid co-signer");

  await addWitnessToMultisigSession(session, witness);

  if (witnesses.length < 2) return "Signed";

  txComplete.assemble(witnesses);
  const signedTx = await txComplete.complete();

  const txHash = await Lucid.wallet
    .submitTx(signedTx.txSigned)
    .catch((e) => console.error(e));

  if (txHash) return { Submitted: txHash };
};

const chunkSubstr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};
