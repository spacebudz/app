import { Address, Lovelace, Lucid, MintingPolicy, OutRef, PolicyId, ScriptHash, SpendingValidator, Tx, TxHash, Unit, UTxO } from "../../deps.js";
import * as D from "../../common/contract.types.js";
import { AssetName, Constraints, ContractConfig, NameAndQuantity, RoyaltyRecipient } from "./types.js";
export declare class Contract {
    lucid: Lucid;
    tradeValidator: SpendingValidator;
    tradeHash: ScriptHash;
    tradeAddress: Address;
    bidPolicy: MintingPolicy;
    bidPolicyId: PolicyId;
    config: ContractConfig;
    fundProtocol: boolean;
    /**
     * Note config.royaltyToken and config.fundProtocol are parameters of the marketplace contract.
     * Changing these parameters changes the plutus script and so the script hash!
     */
    constructor(lucid: Lucid, config?: ContractConfig);
    buy(listingUtxos: UTxO[]): Promise<TxHash>;
    /**
     * Accept specific bids.
     * Optionally you can accept open bids that demand any NFT from the collection for a certain lovelace amount.
     * Specify in this case the asset you are willing to sell for this price.
     */
    sell(sellOptions: {
        bidUtxo: UTxO;
        assetName?: string;
    }[]): Promise<TxHash>;
    /**
     * List asset(s) for a specified lovelace value. Optionally the listing could be private.\
     * Assets can be specified as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    list(assets: NameAndQuantity | AssetName[], lovelace: Lovelace, privateListing?: Address | null): Promise<TxHash>;
    changeListing(listingUtxo: UTxO, lovelace: Lovelace, privateListing?: Address | null): Promise<TxHash>;
    /**
     * A bid can be placed on a specific token or a bundle within a collection
     * by specifying the assets as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    bid(assets: NameAndQuantity | AssetName[], lovelace: Lovelace): Promise<TxHash>;
    /** Create a collection offer on the collection. Optionally add constraints. */
    bidOpen(lovelace: Lovelace, constraints?: {
        types?: string[];
        traits?: {
            negation?: boolean;
            trait: string;
        }[];
    }): Promise<TxHash>;
    /** Swap asset(s) for other asset(s). Lovelace could also be included on the offering side. */
    bidSwap(offering: {
        lovelace?: Lovelace;
        assetNames: string[];
    }, requesting: {
        constraints?: Constraints;
        specific?: string[];
    }): Promise<TxHash>;
    changeBid(bidUtxo: UTxO, lovelace: Lovelace): Promise<TxHash>;
    cancelListing(listingUtxo: UTxO): Promise<TxHash>;
    cancelBid(bidUtxo: UTxO): Promise<TxHash>;
    cancelListingAndSell(listingUtxo: UTxO, bidUtxo: UTxO, assetName?: string): Promise<TxHash>;
    cancelBidAndBuy(bidUtxo: UTxO, listingUtxo: UTxO): Promise<TxHash>;
    /** Get all listings and bids. If there are a lot of UTxOs it is recommended using an indexer (Nebula Watcher) instead. */
    getAllListingsAndBids(): Promise<UTxO[]>;
    /** Get a specific listing or bid. */
    getListingOrBid(outRef: OutRef): Promise<UTxO | null>;
    /** Return the current listings for a specific asset sorted in ascending order by price. */
    getListings(assetName: string): Promise<UTxO[]>;
    /**
     * Return the current bids for a specific token sorted in descending order by price.
     * Or return the collection bids on any token within the collection (use 'Open' as option).
     * Or return swap bids (use 'Swap' as option).
     */
    getBids(option: "Bundle" | "Open" | "Swap" | {
        assetName: string;
    }): Promise<UTxO[]>;
    /**
     * Create a royalty token and lock it in a script controlled by the specified owner.
     * The output the royalty token is in holds the royalty info (fees, recipients) in the datum.\
     */
    static createRoyalty(lucid: Lucid, royaltyRecipients: RoyaltyRecipient[], owner: Address): Promise<{
        txHash: TxHash;
        royaltyToken: Unit;
    }>;
    /** Deploy necessary scripts to reduce tx costs heavily. */
    deployScripts(): Promise<TxHash>;
    /**
     *  Remove scripts from UTxOs. Note tx fees for users will increase again.\
     *  Make sure you are the owner of the UTxOs where the scripts are locked at.
     */
    removeScripts(): Promise<TxHash>;
    /** Return the datum of the UTxO the royalty token is locked in. */
    getRoyaltyInfo(): Promise<{
        utxo: UTxO;
        royaltyInfo: D.RoyaltyInfo;
    }>;
    getRoyalty(): Promise<RoyaltyRecipient[]>;
    getDeployedScripts(): Promise<{
        trade: UTxO | null;
    }>;
    getContractHashes(): {
        scriptHash: ScriptHash;
        nftPolicyId: PolicyId;
        bidPolicyId: PolicyId;
    };
    /**
     * Update royalty info like fees and recipients.
     */
    updateRoyalty(royaltyRecipients: RoyaltyRecipient[]): Promise<TxHash>;
    /**
     * List asset(s) for a specified lovelace value. Optionally the listing could be private.\
     * Assets can be specified as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    _list(assets: NameAndQuantity | AssetName[], lovelace: Lovelace, privateListing?: Address | null): Promise<Tx>;
    /**
     * A bid can be placed on a specific token or a bundle within a collection
     * by specifying the assets as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    _bid(assets: NameAndQuantity | AssetName[], lovelace: Lovelace): Promise<Tx>;
    /** Create a bid on any token within the collection. Optionally add constraints. */
    _bidOpen(lovelace: Lovelace, constraints?: Constraints): Promise<Tx>;
    /** Swap asset(s) for another asset(s). Ada could also be included on the offering side. */
    _bidSwap(offering: {
        lovelace?: Lovelace;
        assetNames: string[];
    }, requesting: {
        constraints?: Constraints;
        specific?: string[];
    }): Promise<Tx>;
    _cancelListing(listingUtxo: UTxO): Promise<Tx>;
    _sell(bidUtxo: UTxO, assetName?: string): Promise<Tx>;
    _cancelBid(bidUtxo: UTxO): Promise<Tx>;
    _buy(listingUtxo: UTxO): Promise<Tx>;
    private _payFee;
    /**
     * This fee is optional and can be set by aggregators. Note the fees are not enforced in the contract, but solely added into the transaction.\
     * Recipient address needs to be a public key or native script address.
     */
    private _payFeeAggregator;
}
