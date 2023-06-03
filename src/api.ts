/* Pulling data from the SpaceBudz API and Blockfrost */
import { OutRef } from "lucid-cardano";
import secrets from "../secrets";
import { ActivityType } from "./parts/explore/RecentActivity";
import { Asset } from "./utils";

export const projectId = secrets.PROJECT_ID;
export const baseUrl = "https://cardano-mainnet.blockfrost.io/api/v0";

const marketplaceUrl = "https://spacebudz.io/api";

type Bid = {
  budId: number;
  amount: BigInt;
  owner: string;
  slot: number;
  // Wormhole
  outRef?: OutRef; // Only Nebula
  isNebula?: boolean;
};

type Listing = {
  budId: number;
  amount: BigInt;
  owner: string;
  slot: number;
  // Wormhole
  outRef?: { txHash: string; outputIndex: number }; // Only Nebula
  isNebula?: boolean;
};

export const getBids = async (): Promise<Bid[]> => {
  const result = await fetch(marketplaceUrl + "/v2v3/bids").then((res) =>
    res.json()
  );
  return result.bids.map((bid) => ({
    budId: parseInt(bid.budId),
    amount: BigInt(bid.amount),
    owner: bid.owner,
    slot: parseInt(bid.slot),
    outRef: bid.outputReference,
    isNebula: bid.isNebula,
  }));
};

export const getBidsMap = async (): Promise<Map<number, Bid>> => {
  const result = await fetch(marketplaceUrl + "/v2v3/bids").then((res) =>
    res.json()
  );
  const bidsMap = new Map<number, Bid>();
  result.bids.sort((a, b) => a.amount - b.amount).forEach((bid) => {
    const parsedBid = {
      budId: parseInt(bid.budId),
      amount: BigInt(bid.amount),
      owner: bid.owner,
      slot: parseInt(bid.slot),
      outRef: bid.outputReference,
      isNebula: bid.isNebula,
    };
    bidsMap.set(parsedBid.budId, parsedBid);
  });
  return bidsMap;
};

export const getListings = async (): Promise<Listing[]> => {
  const result = await fetch(marketplaceUrl + "/v2v3/listings").then(
    (res) => res.json(),
  );
  return result.listings.map((listing) => ({
    budId: parseInt(listing.budId),
    amount: BigInt(listing.amount),
    owner: listing.owner,
    slot: parseInt(listing.slot),
    outRef: listing.outputReference,
    isNebula: listing.isNebula,
  }));
};

export const getListingsMap = async (): Promise<Map<number, Listing>> => {
  const result = await fetch(marketplaceUrl + "/v2v3/listings").then(
    (res) => res.json(),
  );
  const listingsMap = new Map<number, Listing>();
  result.listings.sort((a, b) => a.amount - b.amount).forEach((listing) => {
    const parsedListing = {
      budId: parseInt(listing.budId),
      amount: BigInt(listing.amount),
      owner: listing.owner,
      slot: parseInt(listing.slot),
      outRef: listing.outputReference,
      isNebula: listing.isNebula,
    };
    listingsMap.set(parsedListing.budId, parsedListing);
  });
  return listingsMap;
};

export const getBalance = async (address: string): Promise<Asset[]> => {
  const result = await fetch(`${baseUrl}/addresses/${address}`, {
    headers: { project_id: secrets.PROJECT_ID },
  })
    .then((res) => res.json())
    .then((res) => res.amount);
  return !result?.error
    ? result.map((r) => ({ unit: r.unit, quantity: BigInt(r.quantity) }))
    : [];
};

export const getOwners = async (unit: string): Promise<string[]> => {
  const result = await fetch(`${baseUrl}/assets/${unit}/addresses`, {
    headers: { project_id: secrets.PROJECT_ID },
  }).then((res) => res.json());
  return !result?.error ? result.map((address) => address.address) : [];
};

export const getPriceUSD = async (): Promise<number> => {
  const result = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd`,
  )
    .then((res) => res.json())
    .then((res) => res.cardano["usd"]);
  return result;
};

export const getLastSale = async (budId: number): Promise<BigInt | null> => {
  const result = await fetch(marketplaceUrl + `/v2v3/bud/${budId}/sales`)
    .then((res) => res.json());
  return result?.length > 0 ? BigInt(result[0].amount) : null;
};

type Activity = {
  type: ActivityType;
  budId: number;
  slot: number;
  lovelace: BigInt;
};

export const getActivity = async (): Promise<Activity[]> => {
  const result = await fetch(marketplaceUrl + `/v2v3/activity`).then((
    res,
  ) => res.json());
  return result.filter((r) => r.budId !== null).map((r) => ({
    budId: parseInt(r.budId),
    lovelace: BigInt(r.lovelace),
    slot: parseInt(r.slot),
    type: r.type,
  }));
};

type ProtocolParameters = {
  minFeeA: number;
  minFeeB: number;
  maxTxSize: number;
  maxValSize: number;
  keyDeposit: BigInt;
  poolDeposit: BigInt;
  minUtxo: BigInt; //deprecated
  priceMem: number;
  priceStep: number;
  coinsPerUtxoWord: BigInt;
  slot: number;
};

export const getProtocolParameters = async (): Promise<ProtocolParameters> => {
  const result = await fetch(`${baseUrl}/epochs/latest/parameters`, {
    headers: { project_id: secrets.PROJECT_ID },
  }).then((res) => res.json());
  const slot = await fetch(`${baseUrl}/blocks/latest`, {
    headers: { project_id: secrets.PROJECT_ID },
  })
    .then((res) => res.json())
    .then((res) => res.slot);
  return {
    minFeeA: parseInt(result.min_fee_a),
    minFeeB: parseInt(result.min_fee_b),
    maxTxSize: parseInt(result.max_tx_size),
    maxValSize: parseInt(result.max_val_size),
    keyDeposit: BigInt(result.key_deposit),
    poolDeposit: BigInt(result.pool_deposit),
    minUtxo: BigInt("1000000"),
    priceMem: parseFloat(result.price_mem),
    priceStep: parseFloat(result.price_step),
    coinsPerUtxoWord: BigInt(result.coins_per_utxo_word),
    slot: parseInt(slot),
  };
};

export type UTxO = {
  txHash: string;
  outputIndex: number;
  amount: Asset[];
  address: string;
  datumHash: string;
};

export const getUTxOs = async (address: string): Promise<UTxO[]> => {
  let result = [];
  let page = 1;
  while (true) {
    let pageResult = await fetch(
      `${baseUrl}/addresses/${address}/utxos?page=${page}`,
      { headers: { project_id: secrets.PROJECT_ID } },
    ).then((res) => res.json());
    if (pageResult.error) {
      if ((result as any).status_code === 400) return [];
      else if ((result as any).status_code === 500) return [];
      else {
        pageResult = [];
      }
    }
    result = result.concat(pageResult);
    if (pageResult.length <= 0) break;
    page++;
  }
  return result.map((r) => ({
    txHash: r.tx_hash,
    outputIndex: r.output_index,
    amount: r.amount.map((am) => ({
      unit: am.unit,
      quantity: BigInt(am.quantity),
    })),
    address,
    datumHash: r.data_hash,
  }));
};

type Session = {
  tx: string;
  witnesses: string[];
};

export const getMultisigSession = async (session: string): Promise<Session> => {
  const result = await fetch(
    `https://spacebudz.io/api/multisig/${session}`,
  ).then((res) => res.json());
  return result;
};

export const createMultisigSession = async (tx: string): Promise<string> => {
  const result = await fetch(
    `https://spacebudz.io/api/multisig/createSession`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tx }),
    },
  ).then((res) => res.json());
  return result;
};

export const addWitnessToMultisigSession = async (
  session: string,
  witness: string,
): Promise<boolean> => {
  const result = await fetch(
    `https://spacebudz.io/api/multisig/${session}/signature`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ witness }),
    },
  ).then((res) => res.json());
  return result;
};

export const getAllMigrated = async (): Promise<number[]> => {
  const result = await fetch(marketplaceUrl + `/wormholed`).then((res) =>
    res.json()
  );
  return result;
};
