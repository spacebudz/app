import { Address, Json, Lucid, MerkleTree, MintingPolicy, PolicyId, SpendingValidator, Transaction, Tx, TxHash, UTxO } from "../deps.js";
import { ContractConfig, RoyaltyRecipient } from "./types.js";
import * as D from "./contract.types.js";
export declare class Contract {
    lucid: Lucid;
    referenceValidator: SpendingValidator;
    referenceAddress: Address;
    lockValidator: SpendingValidator;
    lockAddress: Address;
    extraMultisig: SpendingValidator;
    extraAddress: Address;
    mintPolicy: MintingPolicy;
    mintPolicyId: PolicyId;
    config: ContractConfig;
    merkleTree: MerkleTree;
    data: Uint8Array[];
    /**
     * **NOTE**: config.oldPolicyId and config.extraOutRef are parameters of the migration contract.
     * Changing this parameter changes the plutus scripts and so the script hashes!
     */
    constructor(lucid: Lucid, config?: ContractConfig);
    /** Mint Royalty and IP token. We also mint the reference NFT UTxOs for the twins manually, this is an expection, but needs to be done! */
    mintExtra(): Promise<TxHash>;
    /**
     * Update the Intellectual Property of SpaceBudz.
     * Specifiy a URL that points to a document describing the IP.
     * The data behind the URL will be fetched and hashed.
     * The URL and hash will be part of the datum.
     */
    updateIp(url: string): Promise<Transaction>;
    updateRoyalty(royaltyRecipients: RoyaltyRecipient[]): Promise<Transaction>;
    /** Return the datum of the UTxO the royalty token is locked in. */
    getRoyaltyInfo(): Promise<{
        utxo: UTxO;
        royaltyInfo: D.RoyaltyInfo;
    }>;
    getRoyalty(): Promise<RoyaltyRecipient[]>;
    migrate(ids: number[]): Promise<TxHash>;
    _burn(id: number): Promise<Tx>;
    burn(id: number): Promise<TxHash>;
    /** This endpoint doesn't do more than moving the ref NFT to eventually extract min ADA (e.g. protocol parameters changed). */
    move(id: number): Promise<TxHash>;
    hasMigrated(id: number): Promise<boolean>;
    getMetadata(id: number): Promise<Json>;
    getDeployedScripts(): Promise<{
        mint: UTxO | null;
    }>;
    /** Deploy necessary scripts to reduce tx costs. */
    deployScripts(): Promise<TxHash>;
}
