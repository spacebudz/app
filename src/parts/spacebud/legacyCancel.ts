/**
 * Standalone "cancel listing" flow for legacy (Plutus V1) SpaceBudz listings.
 *
 * Why this exists: mainnet's PlutusV1/V2 cost models now have 332 values, but the old
 * tx libraries used by the legacy market (src/cardano/market) and lucid-cardano@0.10.9
 * cap the V1 cost model at 166 entries and throw "CostModel operation 166 out of bounds".
 * This module therefore builds the cancel tx with Lucid Evolution (CML 6) instead and
 * does not import any of the old Market / Lucid code.
 *
 * The cost model must never be truncated: the script data hash is computed from the full
 * model and the node rejects the tx otherwise.
 */
import { baseUrl, projectId } from "../../api";
import { CONTRACT_ADDRESS, DEPRECATED_POLICY_ID } from "../../config";
import { contract } from "../../cardano/market/plutus";
import { blockfrost, loadLucid, unwrapError } from "./legacyShared";

// Used by Dialog.tsx / profile.tsx
export { legacyErrorMessage, waitForLegacyTx } from "./legacyShared";

// Script hash of the legacy market validator (= payment credential of CONTRACT_ADDRESS)
const LEGACY_SCRIPT_HASH =
  "0449932f9da0258d220c39f803ceb8e2c45fdc605e8dd42f35558b58";
// Listing details were stored in the metadata of the listing tx (see Market.getUtxo)
const DATUM_LABEL = 405;
// TradeDatum constructors: StartBid 0, Bid 1, Offer 2
const OFFER_DATUM_INDEX = 2;
// TradeAction constructors: Buy 0, Sell 1, BidHigher 2, Cancel 3
const CANCEL_REDEEMER_INDEX = 3;

export type LegacyListing = {
  budId: number;
  txHash: string;
  outputIndex: number;
  datumCbor: string;
  ownerPkh: string;
  lovelace: bigint;
};

/** Payment key hashes of all addresses the connected (CIP-30) wallet exposes. */
const getWalletKeyHashes = async (
  walletApi: any,
  CML: any
): Promise<string[]> => {
  const hexes: string[] = [];
  for (const getter of ["getUsedAddresses", "getUnusedAddresses"]) {
    try {
      hexes.push(...((await walletApi[getter]()) || []));
    } catch (e) {}
  }
  try {
    hexes.push(await walletApi.getChangeAddress());
  } catch (e) {}

  const hashes = new Set<string>();
  hexes.filter(Boolean).forEach((hex) => {
    try {
      const credential = CML.Address.from_raw_bytes(
        Buffer.from(hex, "hex")
      ).payment_cred();
      if (credential && credential.kind() === 0)
        hashes.add(credential.as_pub_key().to_hex());
    } catch (e) {}
  });
  return Array.from(hashes);
};

/**
 * Finds the on-chain legacy listing of a SpaceBud that belongs to the connected wallet.
 * Throws an Error with a user-readable message if there is none.
 */
export const findLegacyListing = async (
  budId: number,
  walletApi: any
): Promise<LegacyListing> => {
  const { Data, CML } = await loadLucid();

  const unit =
    DEPRECATED_POLICY_ID + Buffer.from(`SpaceBud${budId}`).toString("hex");
  const utxos: any[] =
    (await blockfrost(`/addresses/${CONTRACT_ADDRESS}/utxos/${unit}`)) || [];

  const seen = new Set<string>();
  const found: LegacyListing[] = [];
  for (const utxo of utxos) {
    const key = `${utxo.tx_hash}#${utxo.output_index}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const metadata: any[] =
      (await blockfrost(`/txs/${utxo.tx_hash}/metadata`)) || [];
    const entry = metadata.find((m) => m.label == DATUM_LABEL);
    const datumHex: string | undefined =
      entry && entry.json_metadata && entry.json_metadata[utxo.output_index];
    if (!datumHex) continue;
    const datumCbor = datumHex.slice(2); // strip "0x"

    // The datum from the metadata is only trusted if it matches the datum hash on-chain
    const datumHash = CML.hash_plutus_data(
      CML.PlutusData.from_cbor_hex(datumCbor)
    ).to_hex();
    if (datumHash !== utxo.data_hash) continue;

    const datum = Data.from(datumCbor);
    if (datum.index !== OFFER_DATUM_INDEX) continue; // not a listing
    const [ownerPkh, , requestedLovelace] = datum.fields[0].fields;
    found.push({
      budId,
      txHash: utxo.tx_hash,
      outputIndex: utxo.output_index,
      datumCbor,
      ownerPkh,
      lovelace: BigInt(requestedLovelace),
    });
  }

  if (found.length === 0)
    throw new Error(
      `No active legacy listing found on-chain for SpaceBud #${budId}. It may already have been cancelled or sold.`
    );

  const walletKeyHashes = await getWalletKeyHashes(walletApi, CML);
  const own = found.find((listing) =>
    walletKeyHashes.includes(listing.ownerPkh)
  );
  if (!own)
    throw new Error(
      `The connected wallet is not the owner of the legacy listing for SpaceBud #${budId}. Connect the wallet that created the listing.`
    );
  return own;
};

/**
 * Builds, signs (wallet popup) and submits the cancel tx. Returns the tx hash.
 * Nothing is spent besides the network fee; the SpaceBud returns to the wallet.
 */
export const cancelLegacyListing = async (
  walletApi: any,
  listing: LegacyListing
): Promise<string> => {
  const { Lucid, Blockfrost, Data, Constr, CML, validatorToScriptHash } =
    await loadLucid();

  const run = async (): Promise<string> => {
    const validator = { type: "PlutusV1", script: contract };
    if (validatorToScriptHash(validator) !== LEGACY_SCRIPT_HASH)
      throw new Error(
        "Bundled legacy contract does not match the contract address."
      );

    const lucid = await Lucid(new Blockfrost(baseUrl, projectId), "Mainnet");
    lucid.selectWallet.fromAPI(walletApi);

    const [scriptUtxo] = await lucid.utxosByOutRef([
      { txHash: listing.txHash, outputIndex: listing.outputIndex },
    ]);
    if (!scriptUtxo)
      throw new Error("The listing UTxO is already spent (cancelled or sold).");
    // Datum-hash UTxO: the datum has to be provided in the witness set
    scriptUtxo.datum = listing.datumCbor;

    // The NFT goes back to the wallet's change address
    let changeAddress: string | undefined;
    try {
      changeAddress = CML.Address.from_hex(
        await walletApi.getChangeAddress()
      ).to_bech32(undefined);
    } catch (e) {}

    const tx = await lucid
      .newTx()
      .collectFrom([scriptUtxo], Data.to(new Constr(CANCEL_REDEEMER_INDEX, [])))
      .attach.SpendingValidator(validator)
      .addSignerKey(listing.ownerPkh)
      // Provider (Blockfrost) evaluation: uses the ledger's real cost models
      .complete({ localUPLCEval: false, changeAddress });

    const signed = await tx.sign.withWallet().complete();
    return signed.submit();
  };

  try {
    return await run();
  } catch (e) {
    throw unwrapError(e);
  }
};
