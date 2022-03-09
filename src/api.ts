/* Pulling data from the SpaceBudz API and Blockfrost */
import secrets from "../secrets";
import { ActivityType } from "./parts/explore/RecentActivity";
import { Asset } from "./utils";

type Bid = {
  budId: number;
  amount: BigInt;
  owner: string;
};

type Listing = {
  budId: number;
  amount: BigInt;
  owner: string;
};

export const getBids = async (): Promise<Bid[]> => {
  const result = await fetch("https://spacebudz.io/api/bids").then((res) =>
    res.json()
  );
  return result.bids.map((bid) => ({
    budId: parseInt(bid.budId),
    amount: BigInt(bid.bid.amount),
    owner: bid.bid.owner,
  }));
};

export const getBidsMap = async (): Promise<Map<number, Bid>> => {
  const result = await fetch("https://spacebudz.io/api/bids").then((res) =>
    res.json()
  );
  const bidsMap = new Map<number, Bid>();
  result.bids.forEach((bid) => {
    const parsedBid = {
      budId: parseInt(bid.budId),
      amount: BigInt(bid.bid.amount),
      owner: bid.bid.owner,
    };
    bidsMap.set(parsedBid.budId, parsedBid);
  });
  return bidsMap;
};

export const getListings = async (): Promise<Listing[]> => {
  const result = await fetch("https://spacebudz.io/api/offers").then((res) =>
    res.json()
  );
  return result.offers.map((offer) => ({
    budId: parseInt(offer.budId),
    amount: BigInt(offer.offer.amount),
    owner: offer.offer.owner,
  }));
};

export const getListingsMap = async (): Promise<Map<number, Listing>> => {
  const result = await fetch("https://spacebudz.io/api/offers").then((res) =>
    res.json()
  );
  const listingsMap = new Map<number, Listing>();
  result.offers.forEach((offer) => {
    const parsedListing = {
      budId: parseInt(offer.budId),
      amount: BigInt(offer.offer.amount),
      owner: offer.offer.owner,
    };
    listingsMap.set(parsedListing.budId, parsedListing);
  });
  return listingsMap;
};

export const getBalance = async (address: string): Promise<Asset[]> => {
  const result = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`,
    { headers: { project_id: secrets.PROJECT_ID } }
  )
    .then((res) => res.json())
    .then((res) => res.amount);
  return result ? result : [];
};

export const getOwners = async (unit: string): Promise<string[]> => {
  const result = await fetch(
    `https://cardano-mainnet.blockfrost.io/api/v0/assets/${unit}/addresses`,
    { headers: { project_id: secrets.PROJECT_ID } }
  ).then((res) => res.json());
  return result.map((address) => address.address);
};

export const getPriceUSD = async (): Promise<number> => {
  const result = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd`
  )
    .then((res) => res.json())
    .then((res) => res.cardano["usd"]);
  return result;
};

export const getLastSale = async (budId: number): Promise<BigInt | null> => {
  const result = await fetch(
    `https://spacebudz.io/api/specificSpaceBud/${budId}`
  )
    .then((res) => res.json())
    .then((res) => res.lastSale);
  return result ? BigInt(result) : null;
};

type Activity = {
  type: ActivityType;
  budId: number;
  slot: number;
  lovelace: BigInt;
};

export const getActivity = async (): Promise<Activity[]> => {
  const result = await fetch(`https://spacebudz.io/api/activity`).then((res) =>
    res.json()
  );
  return result.map((r) => ({
    budId: parseInt(r.budId),
    lovelace: BigInt(r.lovelace),
    slot: parseInt(r.slot),
    type: r.type,
  }));
};