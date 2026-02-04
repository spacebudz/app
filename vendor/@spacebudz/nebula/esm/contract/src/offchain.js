import { Data, fromText, fromUnit, paymentCredentialOf, toUnit, } from "../../deps.js";
import { checkVariableFee, fromAddress, fromAssets, sortAsc, sortDesc, toAddress, toAssets, } from "../../common/utils.js";
import * as D from "../../common/contract.types.js";
import { budConfig } from "./config.js";
import { NebulaSpend, OneshotMint } from "./nebula/plutus.js";
export class Contract {
    /**
     * Note config.royaltyToken and config.fundProtocol are parameters of the marketplace contract.
     * Changing these parameters changes the plutus script and so the script hash!
     */
    constructor(lucid, config = budConfig) {
        Object.defineProperty(this, "lucid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tradeValidator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tradeHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tradeAddress", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bidPolicy", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bidPolicyId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fundProtocol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.lucid = lucid;
        this.config = config;
        const { policyId, assetName } = fromUnit(this.config.royaltyToken);
        if (this.config.royaltyToken === SPACEBUDZ_ROYALTY_TOKEN) {
            this.fundProtocol = false;
        }
        else {
            this.fundProtocol = this.lucid.network === "Mainnet"
                ? this.config.fundProtocol ||
                    typeof this.config.fundProtocol === "undefined"
                    ? true
                    : false
                : false;
        }
        const protocolKey = this.lucid.utils.getAddressDetails(PROTOCOL_FUND_ADDRESS).paymentCredential?.hash;
        if (this.fundProtocol && !protocolKey)
            throw "Invalid protocol key!";
        this.tradeValidator = new NebulaSpend(this.fundProtocol ? protocolKey : null, { policyId, assetName: assetName || "" });
        this.tradeHash = lucid.utils.validatorToScriptHash(this.tradeValidator);
        this.tradeAddress = lucid.utils.credentialToAddress(lucid.utils.scriptHashToCredential(this.tradeHash));
        this.bidPolicy = lucid.utils.nativeScriptFromJson({
            type: "any",
            scripts: [
                { type: "after", slot: 0 },
                { type: "sig", keyHash: this.tradeHash },
            ],
        });
        this.bidPolicyId = lucid.utils.mintingPolicyToId(this.bidPolicy);
    }
    async buy(listingUtxos) {
        const buyOrders = (await Promise.all(listingUtxos.map((listingUtxo) => this._buy(listingUtxo))))
            .reduce((prevTx, tx) => prevTx.compose(tx), this.lucid.newTx());
        const tx = await buyOrders
            .compose(this.fundProtocol
            ? this.lucid.newTx().payToAddress(PROTOCOL_FUND_ADDRESS, {})
            : null).complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /**
     * Accept specific bids.
     * Optionally you can accept open bids that demand any NFT from the collection for a certain lovelace amount.
     * Specify in this case the asset you are willing to sell for this price.
     */
    async sell(sellOptions) {
        const sellOrders = (await Promise.all(sellOptions.map(({ bidUtxo, assetName }) => this._sell(bidUtxo, assetName))))
            .reduce((prevTx, tx) => prevTx.compose(tx), this.lucid.newTx());
        const tx = await sellOrders
            .compose(this.fundProtocol
            ? this.lucid.newTx().payToAddress(PROTOCOL_FUND_ADDRESS, {})
            : null).complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /**
     * List asset(s) for a specified lovelace value. Optionally the listing could be private.\
     * Assets can be specified as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    async list(assets, lovelace, privateListing) {
        const tx = await this.lucid.newTx()
            .compose(await this._list(assets, lovelace, privateListing))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    async changeListing(listingUtxo, lovelace, privateListing) {
        const tradeDatum = await this.lucid.datumOf(listingUtxo, NebulaSpend.datum);
        if (!("Listing" in tradeDatum)) {
            throw new Error("Not a listing UTxO");
        }
        const listingDetails = tradeDatum.Listing;
        listingDetails[0].requestedLovelace = lovelace;
        listingDetails[0].privateListing = privateListing
            ? fromAddress(privateListing)
            : null;
        const tx = await this.lucid.newTx()
            .compose(await this._cancelListing(listingUtxo))
            .payToContract(listingUtxo.address, {
            inline: Data.to(tradeDatum, NebulaSpend.datum),
        }, listingUtxo.assets)
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /**
     * A bid can be placed on a specific token or a bundle within a collection
     * by specifying the assets as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    async bid(assets, lovelace) {
        const tx = await this.lucid.newTx()
            .compose(await this._bid(assets, lovelace))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /** Create a collection offer on the collection. Optionally add constraints. */
    async bidOpen(lovelace, constraints) {
        const tx = await this.lucid.newTx()
            .compose(await this._bidOpen(lovelace, constraints))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /** Swap asset(s) for other asset(s). Lovelace could also be included on the offering side. */
    async bidSwap(offering, requesting) {
        const tx = await this.lucid.newTx()
            .compose(await this._bidSwap(offering, requesting))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    async changeBid(bidUtxo, lovelace) {
        const tradeDatum = await this.lucid.datumOf(bidUtxo, NebulaSpend.datum);
        if (!("Bid" in tradeDatum)) {
            throw new Error("Not a bidding UTxO");
        }
        if (Object.keys(bidUtxo.assets).length > 2) {
            throw new Error("Cannot change swap bids.");
        }
        const owner = toAddress(tradeDatum.Bid[0].owner, this.lucid);
        const ownerCredential = paymentCredentialOf(owner);
        const address = await this.lucid.wallet.address();
        const addressCredential = paymentCredentialOf(address);
        if (ownerCredential.type === "Key" &&
            ownerCredential.hash !== addressCredential.hash) {
            throw new Error("You are not the owner.");
        }
        const refScripts = await this.getDeployedScripts();
        const tx = await this.lucid.newTx().collectFrom([bidUtxo], Data.to("Cancel", NebulaSpend.action)).payToContract(bidUtxo.address, {
            inline: bidUtxo.datum,
        }, { ...bidUtxo.assets, lovelace })
            .compose(ownerCredential.type === "Key"
            ? this.lucid.newTx().addSignerKey(ownerCredential.hash)
            : null)
            .compose(refScripts.trade
            ? this.lucid.newTx().readFrom([refScripts.trade])
            : this.lucid.newTx().attachSpendingValidator(this.tradeValidator))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    async cancelListing(listingUtxo) {
        const tx = await this.lucid.newTx().compose(await this._cancelListing(listingUtxo))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    async cancelBid(bidUtxo) {
        const tx = await this.lucid.newTx().compose(await this._cancelBid(bidUtxo))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    async cancelListingAndSell(listingUtxo, bidUtxo, assetName) {
        const tx = await this.lucid.newTx()
            .compose(await this._cancelListing(listingUtxo))
            .compose(await this._sell(bidUtxo, assetName))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    async cancelBidAndBuy(bidUtxo, listingUtxo) {
        const tx = await this.lucid.newTx()
            .compose(await this._cancelBid(bidUtxo))
            .compose(await this._buy(listingUtxo))
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /** Get all listings and bids. If there are a lot of UTxOs it is recommended using an indexer (Nebula Watcher) instead. */
    async getAllListingsAndBids() {
        const utxos = await this.lucid.utxosAt(paymentCredentialOf(this.tradeAddress));
        return utxos.filter((utxo) => Object.keys(utxo.assets)
            .filter((unit) => unit !== "lovelace")
            .every((unit) => unit.startsWith(this.bidPolicyId) ||
            unit.startsWith(this.config.policyId)));
    }
    /** Get a specific listing or bid. */
    async getListingOrBid(outRef) {
        const [utxo] = await this.lucid.utxosByOutRef([outRef]);
        return utxo || null;
    }
    /** Return the current listings for a specific asset sorted in ascending order by price. */
    async getListings(assetName) {
        return (await this.lucid.utxosAtWithUnit(paymentCredentialOf(this.tradeAddress), toUnit(this.config.policyId, assetName))).filter((utxo) => {
            const units = Object.keys(utxo.assets).filter((unit) => unit !== "lovelace");
            return units.every((unit) => unit.startsWith(this.config.policyId)) &&
                units.length >= 1;
        }).sort(sortAsc);
    }
    /**
     * Return the current bids for a specific token sorted in descending order by price.
     * Or return the collection bids on any token within the collection (use 'Open' as option).
     * Or return swap bids (use 'Swap' as option).
     */
    async getBids(option) {
        const bidAssetName = (() => {
            if (option === "Open")
                return fromText("BidOpen");
            if (option === "Swap")
                return fromText("BidSwap");
            if (option === "Bundle")
                return fromText("BidBundle");
            return fromText("Bid") + option.assetName;
        })();
        return (await this.lucid.utxosAtWithUnit(paymentCredentialOf(this.tradeAddress), toUnit(this.bidPolicyId, bidAssetName))).filter((utxo) => {
            const units = Object.keys(utxo.assets).filter((unit) => unit !== "lovelace");
            return units.every((unit) => unit.startsWith(this.bidPolicyId) ||
                unit.startsWith(this.config.policyId)) &&
                (option === "Swap" ? units.length > 1 : units.length === 1);
        }).sort(sortDesc);
    }
    /**
     * Create a royalty token and lock it in a script controlled by the specified owner.
     * The output the royalty token is in holds the royalty info (fees, recipients) in the datum.\
     */
    static async createRoyalty(lucid, royaltyRecipients, owner) {
        const ownerKeyHash = lucid.utils.getAddressDetails(owner).paymentCredential
            ?.hash;
        const ownersScript = lucid.utils.nativeScriptFromJson({
            type: "sig",
            keyHash: ownerKeyHash,
        });
        const ownersAddress = lucid.utils.validatorToAddress(ownersScript);
        const [utxo] = await lucid.wallet.getUtxos();
        const royaltyMintingPolicy = new OneshotMint({
            transactionId: { hash: utxo.txHash },
            outputIndex: BigInt(utxo.outputIndex),
        });
        const royaltyPolicyId = lucid.utils.mintingPolicyToId(royaltyMintingPolicy);
        const royaltyUnit = toUnit(royaltyPolicyId, fromText("Royalty"), 500);
        const royaltyInfo = {
            recipients: royaltyRecipients.map((recipient) => {
                if (recipient.minFee && recipient.maxFee &&
                    recipient.minFee > recipient.maxFee)
                    throw new Error("Min fee cannot be greater than max fee!");
                return {
                    address: fromAddress(recipient.address),
                    fee: checkVariableFee(recipient.fee),
                    minFee: recipient.minFee || null,
                    maxFee: recipient.maxFee || null,
                };
            }),
            version: 1n,
            extra: Data.from(Data.void()),
        };
        const tx = await lucid.newTx()
            .collectFrom([utxo], Data.void())
            .mintAssets({
            [royaltyUnit]: 1n,
        }, Data.void())
            .payToAddressWithData(ownersAddress, { inline: Data.to(royaltyInfo, D.RoyaltyInfo) }, { [royaltyUnit]: 1n })
            .attachMintingPolicy(royaltyMintingPolicy)
            .complete();
        const txSigned = await tx.sign().complete();
        console.log("\n💰 Royalty Token:", royaltyUnit);
        console.log("You can now paste the Royalty Token into the Contract config.\n");
        return { txHash: await txSigned.submit(), royaltyToken: royaltyUnit };
    }
    /** Deploy necessary scripts to reduce tx costs heavily. */
    async deployScripts() {
        if (!this.config.owner) {
            throw new Error("No owner specified. Specify an owner in the config.");
        }
        const credential = paymentCredentialOf(this.config.owner);
        if (credential.type !== "Key") {
            throw new Error("Owner needs to be a public key address.");
        }
        const ownerScript = this.lucid.utils.nativeScriptFromJson({
            type: "sig",
            keyHash: credential.hash,
        });
        const ownerAddress = this.lucid.utils.validatorToAddress(ownerScript);
        const tx = await this.lucid.newTx()
            .payToAddressWithData(ownerAddress, {
            scriptRef: this.tradeValidator,
        }, {}).complete();
        const txSigned = await tx.sign().complete();
        console.log("\n⛓ Deploy Tx Hash:", txSigned.toHash());
        console.log("You can now paste the Tx Hash into the Contract config.\n");
        return txSigned.submit();
    }
    /**
     *  Remove scripts from UTxOs. Note tx fees for users will increase again.\
     *  Make sure you are the owner of the UTxOs where the scripts are locked at.
     */
    async removeScripts() {
        if (!this.config.owner) {
            throw new Error("No owner specified. Specify an owner in the config.");
        }
        const credential = paymentCredentialOf(this.config.owner);
        if (credential.type !== "Key") {
            throw new Error("Owner needs to be a public key address.");
        }
        if (credential.hash !==
            paymentCredentialOf(await this.lucid.wallet.address()).hash)
            throw new Error("You are not the owner.");
        const ownerScript = this.lucid.utils.nativeScriptFromJson({
            type: "sig",
            keyHash: credential.hash,
        });
        const refScripts = await this.getDeployedScripts();
        if (!refScripts.trade)
            throw new Error("No script are not deployed.");
        const tx = await this.lucid.newTx()
            .collectFrom([refScripts.trade])
            .attachSpendingValidator(ownerScript)
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /** Return the datum of the UTxO the royalty token is locked in. */
    async getRoyaltyInfo() {
        const utxo = await this.lucid.utxoByUnit(this.config.royaltyToken);
        if (!utxo)
            throw new Error("Royalty info not found.");
        return {
            utxo,
            royaltyInfo: await this.lucid.datumOf(utxo, D.RoyaltyInfo),
        };
    }
    async getRoyalty() {
        const { royaltyInfo } = await this.getRoyaltyInfo();
        return royaltyInfo.recipients.map((recipient) => ({
            address: toAddress(recipient.address, this.lucid),
            fee: 10 / Number(recipient.fee),
            minFee: recipient.minFee,
            maxFee: recipient.maxFee,
        }));
    }
    async getDeployedScripts() {
        if (!this.config.deployHash)
            return { trade: null };
        const [trade] = await this.lucid.utxosByOutRef([{
                txHash: this.config.deployHash,
                outputIndex: 0,
            }]);
        return { trade };
    }
    getContractHashes() {
        return {
            scriptHash: this.tradeHash,
            nftPolicyId: this.config.policyId,
            bidPolicyId: this.bidPolicyId,
        };
    }
    /**
     * Update royalty info like fees and recipients.
     */
    async updateRoyalty(royaltyRecipients) {
        if (!this.config.owner) {
            throw new Error("No owner specified. Specify an owner in the config.");
        }
        const credential = paymentCredentialOf(this.config.owner);
        if (credential.type !== "Key") {
            throw new Error("Owner needs to be a public key address.");
        }
        const ownersScript = this.lucid.utils.nativeScriptFromJson({
            type: "sig",
            keyHash: credential.hash,
        });
        const ownerAddress = this.lucid.utils.validatorToAddress(ownersScript);
        const utxos = await this.lucid.utxosAt(paymentCredentialOf(ownerAddress));
        const royaltyUtxo = utxos.find((utxo) => utxo.assets[this.config.royaltyToken]);
        if (!royaltyUtxo)
            throw new Error("NoUTxOError");
        const royaltyInfo = {
            recipients: royaltyRecipients.map((recipient) => ({
                address: fromAddress(recipient.address),
                fee: checkVariableFee(recipient.fee),
                minFee: recipient.minFee || null,
                maxFee: recipient.maxFee || null,
            })),
            version: 1n,
            extra: Data.from(Data.void()),
        };
        const tx = await this.lucid.newTx()
            .collectFrom([royaltyUtxo])
            .payToAddressWithData(ownerAddress, { inline: Data.to(royaltyInfo, D.RoyaltyInfo) }, royaltyUtxo.assets)
            .attachSpendingValidator(ownersScript)
            .complete();
        const txSigned = await tx.sign().complete();
        return txSigned.submit();
    }
    /**
     * List asset(s) for a specified lovelace value. Optionally the listing could be private.\
     * Assets can be specified as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    async _list(assets, lovelace, privateListing) {
        const assetsMap = assets instanceof Array
            ? Object.fromEntries(assets.map((assetName) => [assetName, 1n]))
            : assets;
        if (Object.keys(assetsMap).length <= 0) {
            throw new Error("Needs at least one asset.");
        }
        const ownerAddress = await this.lucid.wallet.address();
        const { stakeCredential } = this.lucid.utils
            .getAddressDetails(ownerAddress);
        // We include the stake key of the signer if applicable
        const tradeAddressWithStake = this.lucid.utils.credentialToAddress(this.lucid.utils.scriptHashToCredential(this.tradeHash), stakeCredential);
        const tradeDatum = {
            Listing: [
                {
                    owner: fromAddress(ownerAddress),
                    requestedLovelace: lovelace,
                    privateListing: privateListing ? fromAddress(privateListing) : null,
                },
            ],
        };
        const listingAssets = Object.fromEntries(Object.entries(assetsMap).map(([assetName, quantity]) => [toUnit(this.config.policyId, assetName), quantity]));
        return this.lucid.newTx().payToContract(tradeAddressWithStake, {
            inline: Data.to(tradeDatum, NebulaSpend.datum),
        }, listingAssets);
    }
    /**
     * A bid can be placed on a specific token or a bundle within a collection
     * by specifying the assets as either an array of asset names
     * (assuming each asset has a quantity of 1) or as a map,
     * where the quantity of each asset can be chosen.
     */
    async _bid(assets, lovelace) {
        const assetsMap = assets instanceof Array
            ? Object.fromEntries(assets.map((assetName) => [assetName, 1n]))
            : assets;
        const bidNames = Object.keys(assetsMap);
        if (bidNames.length <= 0) {
            throw new Error("Needs at least one asset name.");
        }
        const ownerAddress = await this.lucid.wallet.address();
        const { stakeCredential } = this.lucid.utils.getAddressDetails(ownerAddress);
        const bidAssets = Object.fromEntries(Object.entries(assetsMap).map(([assetName, quantity]) => [toUnit(this.config.policyId, assetName), quantity]));
        const bidAssetName = bidNames.length > 1
            ? fromText("BidBundle")
            : fromText("Bid") + bidNames[0];
        // We include the stake key of the signer
        const tradeAddressWithStake = this.lucid.utils.credentialToAddress(this.lucid.utils.scriptHashToCredential(this.tradeHash), stakeCredential);
        const biddingDatum = {
            Bid: [{
                    owner: fromAddress(ownerAddress),
                    requestedOption: {
                        SpecificValue: [
                            fromAssets(bidAssets),
                        ],
                    },
                }],
        };
        return this.lucid.newTx()
            .mintAssets({
            [toUnit(this.bidPolicyId, bidAssetName)]: 1n,
        })
            .payToContract(tradeAddressWithStake, {
            inline: Data.to(biddingDatum, NebulaSpend.datum),
        }, {
            lovelace,
            [toUnit(this.bidPolicyId, bidAssetName)]: 1n,
        })
            .validFrom(this.lucid.utils.slotToUnixTime(1000))
            .attachMintingPolicy(this.bidPolicy);
    }
    /** Create a bid on any token within the collection. Optionally add constraints. */
    async _bidOpen(lovelace, constraints) {
        const ownerAddress = await this.lucid.wallet.address();
        const { stakeCredential } = this.lucid.utils.getAddressDetails(ownerAddress);
        const tradeAddressWithStake = this.lucid.utils.credentialToAddress(this.lucid.utils.scriptHashToCredential(this.tradeHash), stakeCredential);
        const biddingDatum = {
            Bid: [{
                    owner: fromAddress(ownerAddress),
                    requestedOption: {
                        SpecificPolicyIdWithConstraints: [
                            this.config.policyId,
                            constraints?.types ? constraints.types.map(fromText) : [],
                            constraints?.traits
                                ? constraints.traits.map(({ negation, trait }) => negation
                                    ? { Excluded: [fromText(trait)] }
                                    : { Included: [fromText(trait)] })
                                : null,
                        ],
                    },
                }],
        };
        return this.lucid.newTx()
            .mintAssets({
            [toUnit(this.bidPolicyId, fromText("BidOpen"))]: 1n,
        })
            .payToContract(tradeAddressWithStake, {
            inline: Data.to(biddingDatum, NebulaSpend.datum),
        }, {
            lovelace,
            [toUnit(this.bidPolicyId, fromText("BidOpen"))]: 1n,
        })
            .validFrom(this.lucid.utils.slotToUnixTime(1000))
            .attachMintingPolicy(this.bidPolicy);
    }
    /** Swap asset(s) for another asset(s). Ada could also be included on the offering side. */
    async _bidSwap(offering, requesting) {
        if ([requesting.constraints, requesting.specific].filter((t) => t).length !==
            1) {
            throw new Error("You can/must have either constraints or a specific request.");
        }
        if (offering.assetNames.length <= 0) {
            throw new Error("Needs at least one offering asset name.");
        }
        if (requesting.specific && requesting.specific.length <= 0) {
            throw new Error("Needs at least one requesting asset name.");
        }
        const ownerAddress = await this.lucid.wallet.address();
        const { stakeCredential } = this.lucid.utils.getAddressDetails(ownerAddress);
        const tradeAddressWithStake = this.lucid.utils.credentialToAddress(this.lucid.utils.scriptHashToCredential(this.tradeHash), stakeCredential);
        const biddingDatum = {
            Bid: [{
                    owner: fromAddress(ownerAddress),
                    requestedOption: requesting.specific
                        ? {
                            SpecificValue: [
                                fromAssets(Object.fromEntries(requesting.specific.map((assetName) => [toUnit(this.config.policyId, assetName), 1n]))),
                            ],
                        }
                        : {
                            SpecificPolicyIdWithConstraints: [
                                this.config.policyId,
                                requesting.constraints?.types
                                    ? requesting.constraints.types.map(fromText)
                                    : [],
                                requesting.constraints?.traits
                                    ? requesting.constraints.traits.map(({ negation, trait }) => negation
                                        ? { Excluded: [fromText(trait)] }
                                        : { Included: [fromText(trait)] })
                                    : null,
                            ],
                        },
                }],
        };
        const offeringAssets = Object.fromEntries(offering.assetNames.map((assetName) => [toUnit(this.config.policyId, assetName), 1n]));
        if (offering.lovelace)
            offeringAssets.lovelace = offering.lovelace;
        return this.lucid.newTx()
            .mintAssets({
            [toUnit(this.bidPolicyId, fromText("BidSwap"))]: 1n,
        })
            .payToContract(tradeAddressWithStake, {
            inline: Data.to(biddingDatum, NebulaSpend.datum),
        }, {
            ...offeringAssets,
            [toUnit(this.bidPolicyId, fromText("BidSwap"))]: 1n,
        })
            .validFrom(this.lucid.utils.slotToUnixTime(1000))
            .attachMintingPolicy(this.bidPolicy);
    }
    async _cancelListing(listingUtxo) {
        const tradeDatum = await this.lucid.datumOf(listingUtxo, NebulaSpend.datum);
        if (!("Listing" in tradeDatum)) {
            throw new Error("Not a listing UTxO");
        }
        const owner = toAddress(tradeDatum.Listing[0].owner, this.lucid);
        const ownerCredential = paymentCredentialOf(owner);
        const address = await this.lucid.wallet.address();
        const addressCredential = paymentCredentialOf(address);
        if (ownerCredential.type === "Key" &&
            ownerCredential.hash !== addressCredential.hash) {
            throw new Error("You are not the owner.");
        }
        const refScripts = await this.getDeployedScripts();
        return this.lucid.newTx()
            .collectFrom([listingUtxo], Data.to("Cancel", NebulaSpend.action))
            .compose(ownerCredential.type === "Key"
            ? this.lucid.newTx().addSignerKey(ownerCredential.hash)
            : null)
            .compose(refScripts.trade
            ? this.lucid.newTx().readFrom([refScripts.trade])
            : this.lucid.newTx().attachSpendingValidator(this.tradeValidator));
    }
    async _sell(bidUtxo, assetName) {
        const tradeDatum = await this.lucid.datumOf(bidUtxo, NebulaSpend.datum);
        if (!("Bid" in tradeDatum)) {
            throw new Error("Not a bidding UTxO");
        }
        const bidDetails = tradeDatum.Bid[0];
        const { lovelace } = bidUtxo.assets;
        const bidToken = Object.keys(bidUtxo.assets).find((unit) => unit.startsWith(this.bidPolicyId));
        if (!bidToken)
            throw new Error("No bid token found.");
        const owner = toAddress(bidDetails.owner, this.lucid);
        const { requestedAssets, refNFT } = (() => {
            if ("SpecificValue" in bidDetails.requestedOption) {
                return {
                    requestedAssets: toAssets(bidDetails.requestedOption.SpecificValue[0]),
                    refNFT: null,
                };
            }
            else if ("SpecificPolicyIdWithConstraints" in bidDetails.requestedOption &&
                assetName) {
                const policyId = bidDetails.requestedOption.SpecificPolicyIdWithConstraints[0];
                const refNFT = toUnit(policyId, fromUnit(toUnit(policyId, assetName)).name, 100);
                const types = bidDetails.requestedOption.SpecificPolicyIdWithConstraints[1];
                const traits = bidDetails.requestedOption.SpecificPolicyIdWithConstraints[2];
                return {
                    requestedAssets: {
                        [toUnit(policyId, assetName)]: 1n,
                    },
                    refNFT: types.length > 0 || traits ? refNFT : null,
                };
            }
            throw new Error("No variant matched.");
        })();
        const paymentDatum = Data.to({
            outRef: {
                transactionId: { hash: bidUtxo.txHash },
                outputIndex: BigInt(bidUtxo.outputIndex),
            },
        }, D.PaymentDatum);
        const refScripts = await this.getDeployedScripts();
        return this.lucid.newTx()
            .collectFrom([bidUtxo], Data.to("Sell", NebulaSpend.action))
            .compose(refNFT
            ? await (async () => {
                const refUtxo = await this.lucid.utxoByUnit(refNFT);
                if (!refUtxo)
                    throw new Error("This NFT doesn't support CIP-0068");
                return this.lucid.newTx().readFrom([refUtxo]);
            })()
            : null)
            .compose((await this._payFee(lovelace, paymentDatum)).tx)
            .compose(this._payFeeAggregator(lovelace))
            .payToAddressWithData(owner, {
            inline: paymentDatum,
        }, requestedAssets)
            .mintAssets({ [bidToken]: -1n })
            .validFrom(this.lucid.utils.slotToUnixTime(1000))
            .compose(refScripts.trade
            ? this.lucid.newTx().readFrom([refScripts.trade])
            : this.lucid.newTx().attachSpendingValidator(this.tradeValidator))
            .attachMintingPolicy(this.bidPolicy);
    }
    async _cancelBid(bidUtxo) {
        const tradeDatum = await this.lucid.datumOf(bidUtxo, NebulaSpend.datum);
        if (!("Bid" in tradeDatum)) {
            throw new Error("Not a bidding UTxO");
        }
        const owner = toAddress(tradeDatum.Bid[0].owner, this.lucid);
        const ownerCredential = paymentCredentialOf(owner);
        const address = await this.lucid.wallet.address();
        const addressCredential = paymentCredentialOf(address);
        if (ownerCredential.type === "Key" &&
            ownerCredential.hash !== addressCredential.hash) {
            throw new Error("You are not the owner.");
        }
        const [bidToken] = Object.keys(bidUtxo.assets).filter((unit) => unit.startsWith(this.bidPolicyId));
        const refScripts = await this.getDeployedScripts();
        return this.lucid.newTx()
            .collectFrom([bidUtxo], Data.to("Cancel", NebulaSpend.action))
            .mintAssets({ [bidToken]: -1n })
            .validFrom(this.lucid.utils.slotToUnixTime(1000))
            .compose(ownerCredential.type === "Key"
            ? this.lucid.newTx().addSignerKey(ownerCredential.hash)
            : null)
            .compose(refScripts.trade
            ? this.lucid.newTx().readFrom([refScripts.trade])
            : this.lucid.newTx().attachSpendingValidator(this.tradeValidator))
            .attachMintingPolicy(this.bidPolicy);
    }
    async _buy(listingUtxo) {
        const tradeDatum = await this.lucid.datumOf(listingUtxo, NebulaSpend.datum);
        if (!("Listing" in tradeDatum)) {
            throw new Error("Not a listing UTxO");
        }
        const owner = toAddress(tradeDatum.Listing[0].owner, this.lucid);
        const requestedLovelace = tradeDatum.Listing[0].requestedLovelace;
        const privateListing = tradeDatum.Listing[0].privateListing;
        const paymentDatum = Data.to({
            outRef: {
                transactionId: { hash: listingUtxo.txHash },
                outputIndex: BigInt(listingUtxo.outputIndex),
            },
        }, D.PaymentDatum);
        const refScripts = await this.getDeployedScripts();
        return this.lucid.newTx()
            .collectFrom([listingUtxo], Data.to("Buy", NebulaSpend.action))
            .compose(await (async () => {
            const { tx, remainingLovelace } = await this._payFee(requestedLovelace, paymentDatum);
            return tx.payToAddressWithData(owner, { inline: paymentDatum }, {
                lovelace: remainingLovelace,
            });
        })())
            .compose(this._payFeeAggregator(requestedLovelace))
            .compose(privateListing
            ? this.lucid.newTx().addSigner(toAddress(privateListing, this.lucid))
            : null)
            .compose(refScripts.trade
            ? this.lucid.newTx().readFrom([refScripts.trade])
            : this.lucid.newTx().attachSpendingValidator(this.tradeValidator));
    }
    async _payFee(lovelace, paymentDatum) {
        const tx = this.lucid.newTx();
        const { utxo, royaltyInfo } = await this.getRoyaltyInfo();
        let remainingLovelace = lovelace;
        const recipients = royaltyInfo.recipients;
        for (const recipient of recipients) {
            const address = toAddress(recipient.address, this.lucid);
            const fee = recipient.fee;
            const minFee = recipient.minFee;
            const maxFee = recipient.maxFee;
            const feeToPay = (lovelace * 10n) / fee;
            const adjustedFee = minFee && feeToPay < minFee
                ? minFee
                : maxFee && feeToPay > maxFee
                    ? maxFee
                    : feeToPay;
            remainingLovelace -= adjustedFee;
            tx.payToAddressWithData(address, { inline: paymentDatum }, {
                lovelace: adjustedFee,
            });
        }
        tx.readFrom([utxo]);
        // max(0, remainingLovelace)
        remainingLovelace = remainingLovelace < 0n ? 0n : remainingLovelace;
        return { tx, remainingLovelace };
    }
    /**
     * This fee is optional and can be set by aggregators. Note the fees are not enforced in the contract, but solely added into the transaction.\
     * Recipient address needs to be a public key or native script address.
     */
    _payFeeAggregator(lovelace) {
        if (this.config.aggregatorFee && this.config.aggregatorFee.length > 0) {
            const tx = this.lucid.newTx();
            this.config.aggregatorFee.forEach((recipient) => {
                const fee = checkVariableFee(recipient.fee);
                const minFee = recipient.minFee;
                const maxFee = recipient.maxFee;
                const feeToPay = (lovelace * 10n) / fee;
                const adjustedFee = minFee && feeToPay < minFee
                    ? minFee
                    : maxFee && feeToPay > maxFee
                        ? maxFee
                        : feeToPay;
                tx.payToAddress(recipient.address, {
                    lovelace: adjustedFee,
                });
            });
            return tx;
        }
        else {
            return null;
        }
    }
}
const SPACEBUDZ_ROYALTY_TOKEN = "4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f001f4d70526f79616c7479";
const PROTOCOL_FUND_ADDRESS = "addr1vxuj4yyqlz0k9er5geeepx0awh2t6kkes0nyp429hsttt3qrnucsx";
