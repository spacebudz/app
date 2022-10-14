import Loader from "./loader.js";
import {
  assetsToValue,
  fromAscii,
  fromHex,
  getTradeDetails,
  lovelacePercentage,
  toBytesNum,
  toHex,
  valueToAssets,
} from "./utils.js";
import { costModel, languageViews } from "./languageViews.js";
import { contract } from "./plutus.js";
// import CoinSelection from "./coinSelection.js";
import {
  Address,
  PlutusData,
  TransactionUnspentOutput,
} from "./custom_modules/@emurgo/cardano-multiplatform-lib-browser/cardano_multiplatform_lib.js";

const DATUM_LABEL = 405;
const ADDRESS_LABEL = 406;

// Validator
const CONTRACT = () => {
  const scripts = Loader.Cardano.PlutusScripts.new();
  scripts.add(Loader.Cardano.PlutusScript.new(fromHex(contract)));
  return scripts;
};

const CONTRACT_ADDRESS = () =>
  Loader.Cardano.Address.from_bech32(
    "addr1wyzynye0nksztrfzpsulsq7whr3vgh7uvp0gm4p0x42ckkqqq6kxq"
  );

// Datums
const START_BID = () => {
  const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str(DATUM_TYPE.StartBid.toString()),
      Loader.Cardano.PlutusList.new()
    )
  );
  return datum;
};
const BID = ({ tradeOwner, budId }) => {
  const fieldsInner = Loader.Cardano.PlutusList.new();
  fieldsInner.add(Loader.Cardano.PlutusData.new_bytes(fromHex(tradeOwner)));
  fieldsInner.add(
    Loader.Cardano.PlutusData.new_bytes(fromHex(toBytesNum(budId)))
  );
  fieldsInner.add(
    Loader.Cardano.PlutusData.new_integer(Loader.Cardano.BigInt.from_str("1"))
  );
  const tradeDetails = Loader.Cardano.PlutusList.new();
  tradeDetails.add(
    Loader.Cardano.PlutusData.new_constr_plutus_data(
      Loader.Cardano.ConstrPlutusData.new(
        Loader.Cardano.BigNum.from_str("0"),
        fieldsInner
      )
    )
  );
  const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str(DATUM_TYPE.Bid.toString()),
      tradeDetails
    )
  );
  return datum;
};
const OFFER = ({ tradeOwner, budId, requestedAmount }) => {
  const fieldsInner = Loader.Cardano.PlutusList.new();
  fieldsInner.add(Loader.Cardano.PlutusData.new_bytes(fromHex(tradeOwner)));
  fieldsInner.add(
    Loader.Cardano.PlutusData.new_bytes(fromHex(toBytesNum(budId)))
  );
  fieldsInner.add(
    Loader.Cardano.PlutusData.new_integer(
      Loader.Cardano.BigInt.from_str(requestedAmount)
    )
  );
  const tradeDetails = Loader.Cardano.PlutusList.new();
  tradeDetails.add(
    Loader.Cardano.PlutusData.new_constr_plutus_data(
      Loader.Cardano.ConstrPlutusData.new(
        Loader.Cardano.BigNum.from_str("0"),
        fieldsInner
      )
    )
  );
  const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str(DATUM_TYPE.Offer.toString()),
      tradeDetails
    )
  );
  return datum;
};

const DATUM_TYPE = {
  StartBid: 0,
  Bid: 1,
  Offer: 2,
};

// Redeemers
const BUY = (index) => {
  const redeemerData = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str("0"),
      Loader.Cardano.PlutusList.new()
    )
  );
  const redeemer = Loader.Cardano.Redeemer.new(
    Loader.Cardano.RedeemerTag.new_spend(),
    Loader.Cardano.BigNum.from_str(index),
    redeemerData,
    Loader.Cardano.ExUnits.new(
      Loader.Cardano.BigNum.from_str("7000000"),
      Loader.Cardano.BigNum.from_str("3000000000")
    )
  );
  return redeemer;
};
const SELL = (index) => {
  const redeemerData = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str("1"),
      Loader.Cardano.PlutusList.new()
    )
  );
  const redeemer = Loader.Cardano.Redeemer.new(
    Loader.Cardano.RedeemerTag.new_spend(),
    Loader.Cardano.BigNum.from_str(index),
    redeemerData,
    Loader.Cardano.ExUnits.new(
      Loader.Cardano.BigNum.from_str("7000000"),
      Loader.Cardano.BigNum.from_str("3000000000")
    )
  );
  return redeemer;
};
const BID_HIGHER = (index) => {
  const redeemerData = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str("2"),
      Loader.Cardano.PlutusList.new()
    )
  );
  const redeemer = Loader.Cardano.Redeemer.new(
    Loader.Cardano.RedeemerTag.new_spend(),
    Loader.Cardano.BigNum.from_str(index),
    redeemerData,
    Loader.Cardano.ExUnits.new(
      Loader.Cardano.BigNum.from_str("7000000"),
      Loader.Cardano.BigNum.from_str("3000000000")
    )
  );
  return redeemer;
};
const CANCEL = (index) => {
  const redeemerData = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.BigNum.from_str("3"),
      Loader.Cardano.PlutusList.new()
    )
  );
  const redeemer = Loader.Cardano.Redeemer.new(
    Loader.Cardano.RedeemerTag.new_spend(),
    Loader.Cardano.BigNum.from_str(index),
    redeemerData,
    Loader.Cardano.ExUnits.new(
      Loader.Cardano.BigNum.from_str("5000000"),
      Loader.Cardano.BigNum.from_str("2000000000")
    )
  );
  return redeemer;
};

const toFraction = (p) => Math.floor(1 / (p / 1000));

class SpaceBudzMarket {
  constructor({ base, projectId }, extraFeeRecipient) {
    this.provider = { base, projectId };
    this.extraFeeRecipient = extraFeeRecipient;
  }

  /**
   *
   * @typedef {Object} TradeUtxo
   * @property {PlutusData} datum
   * @property {Address} tradeOwnerAddress
   * @property {TransactionUnspentOutput} utxo
   * @property {string} budId
   * @property {string} lovelace bid amount or requested amount from offer
   */

  /**
   *@private
   */
  async blockfrostRequest(endpoint, headers, body) {
    return await fetch(this.provider.base + endpoint, {
      headers: {
        project_id: this.provider.projectId,
        ...headers,
        "User-Agent": "spacebudz-marketplace",
      },
      method: body ? "POST" : "GET",
      body,
    }).then((res) => res.json());
  }

  /**
   * @private
   * @returns {TradeUtxo[]}
   */
  async getUtxo(policy, prefix, budId) {
    const asset = policy + fromAscii(prefix + budId);

    let utxos = await this.blockfrostRequest(
      `/addresses/${CONTRACT_ADDRESS().to_bech32()}/utxos/${asset}`
    );

    // We only do this because of a temporary bug in Blockfrost

    if (utxos.length > 0) {
      const checkUtxo = utxos[0];
      utxos = utxos.filter(
        (utxo) =>
          utxo.tx_hash !== checkUtxo.tx_hash &&
          utxo.output_index !== checkUtxo.output_index
      );
      utxos = [checkUtxo, ...utxos];
    }

    //

    return await Promise.all(
      utxos.map(async (utxo) => {
        const metadata = await this.blockfrostRequest(
          `/txs/${utxo.tx_hash}/metadata`
        );
        let datum;
        let tradeOwnerAddress;
        try {
          datum = metadata
            .find((m) => m.label == DATUM_LABEL)
            .json_metadata[utxo.output_index].slice(2);
          datum = Loader.Cardano.PlutusData.from_bytes(fromHex(datum));
          if (
            datum.as_constr_plutus_data().alternative().to_str() !==
            START_BID().as_constr_plutus_data().alternative().to_str()
          )
            //STARTBID doesn't have a tradeOwner
            tradeOwnerAddress = metadata
              .find((m) => m.label == ADDRESS_LABEL)
              .json_metadata.address.slice(2);
        } catch (e) {
          throw new Error("Some required metadata entries were not found");
        }

        if (
          toHex(Loader.Cardano.hash_plutus_data(datum).to_bytes()) !==
          utxo.data_hash
        )
          throw new Error("Datum hash doesn't match");

        return {
          datum,
          tradeOwnerAddress:
            tradeOwnerAddress &&
            Loader.Cardano.Address.from_bytes(fromHex(tradeOwnerAddress)),
          utxo: Loader.Cardano.TransactionUnspentOutput.new(
            Loader.Cardano.TransactionInput.new(
              Loader.Cardano.TransactionHash.from_bytes(fromHex(utxo.tx_hash)),
              Loader.Cardano.BigNum.from_str(utxo.output_index.toString())
            ),
            Loader.Cardano.TransactionOutput.new(
              CONTRACT_ADDRESS(),
              assetsToValue(utxo.amount)
            )
          ),
          budId,
        };
      })
    );
  }

  /**
   *@private
   */
  async initTx() {
    const costmdls = Loader.Cardano.Costmdls.new();
    const costmdl = Loader.Cardano.CostModel.new();
    Object.values(this.protocolParameters.costModels.PlutusV1).forEach(
      (cost, index) => {
        costmdl.set(index, Loader.Cardano.Int.new_i32(cost));
      }
    );
    costmdls.insert(Loader.Cardano.Language.new_plutus_v1(), costmdl);

    const txBuilderConfig = Loader.Cardano.TransactionBuilderConfigBuilder.new()
      .coins_per_utxo_byte(
        Loader.Cardano.BigNum.from_str(this.protocolParameters.coinsPerUtxoByte)
      )
      .fee_algo(
        Loader.Cardano.LinearFee.new(
          Loader.Cardano.BigNum.from_str(
            this.protocolParameters.linearFee.minFeeA
          ),
          Loader.Cardano.BigNum.from_str(
            this.protocolParameters.linearFee.minFeeB
          )
        )
      )
      .key_deposit(
        Loader.Cardano.BigNum.from_str(this.protocolParameters.keyDeposit)
      )
      .pool_deposit(
        Loader.Cardano.BigNum.from_str(this.protocolParameters.poolDeposit)
      )
      .max_tx_size(this.protocolParameters.maxTxSize)
      .max_value_size(this.protocolParameters.maxValSize)
      .ex_unit_prices(
        Loader.Cardano.ExUnitPrices.from_float(
          this.protocolParameters.priceMem,
          this.protocolParameters.priceStep
        )
      )
      .collateral_percentage(this.protocolParameters.collateralPercentage)
      .max_collateral_inputs(this.protocolParameters.maxCollateralInputs)
      .costmdls(costmdls)
      .blockfrost(
        Loader.Cardano.Blockfrost.new(
          this.provider.base + "/utils/txs/evaluate",
          this.provider.projectId
        )
      )
      .build();
    const txBuilder = Loader.Cardano.TransactionBuilder.new(txBuilderConfig);
    const datums = Loader.Cardano.PlutusList.new();
    const metadata = { [DATUM_LABEL]: {}, [ADDRESS_LABEL]: {} };
    const outputs = Loader.Cardano.TransactionOutputs.new();
    return { txBuilder, datums, metadata, outputs };
  }

  /**
   * @private
   */
  policyBidLength(value) {
    if (!value.multiasset()) return 0;
    const policy = Loader.Cardano.ScriptHash.from_bytes(
      Loader.Cardano.Ed25519KeyHash.from_bytes(
        fromHex(this.contractInfo.policyBid)
      ).to_bytes()
    );
    return value.multiasset().get(policy).len();
  }

  /**
   * @private
   */
  policyBidRemaining(value, budId) {
    const assets = valueToAssets(value);
    return assetsToValue(
      assets.filter(
        (asset) =>
          asset.unit !=
            this.contractInfo.policyBid +
              fromAscii(this.contractInfo.prefixSpaceBudBid + budId) &&
          asset.unit.startsWith(this.contractInfo.policyBid)
      )
    );
  }

  /**
   * @private
   */
  createOutput(
    address,
    value,
    { datum, index, tradeOwnerAddress, metadata } = {}
  ) {
    const output = Loader.Cardano.TransactionOutput.new(address, value);
    if (datum) {
      output.set_datum(
        Loader.Cardano.Datum.new_data_hash(
          Loader.Cardano.hash_plutus_data(datum)
        )
      );
      metadata[DATUM_LABEL][index] = "0x" + toHex(datum.to_bytes());
    }
    if (tradeOwnerAddress) {
      metadata[ADDRESS_LABEL].address =
        "0x" + toHex(tradeOwnerAddress.to_address().to_bytes());
    }
    return output;
  }

  /**
   * @private
   */
  async finalizeTx({
    txBuilder,
    changeAddress,
    utxos,
    outputs,
    datums,
    metadata,
    scriptUtxo,
    action,
  }) {
    for (let i = 0; i < outputs.len(); i++) {
      txBuilder.add_output(outputs.get(i));
    }
    if (scriptUtxo) {
      txBuilder.add_input(
        scriptUtxo,
        Loader.Cardano.ScriptWitness.new_plutus_witness(
          Loader.Cardano.PlutusWitness.new(action("0").data())
        )
      );

      txBuilder.add_plutus_script(CONTRACT().get(0));

      for (let i = 0; i < datums.len(); i++) {
        txBuilder.add_plutus_data(datums.get(i));
      }

      const collateral = (
        await (
          window.cardano.selectedWallet.experimental ||
          window.cardano.selectedWallet
        ).getCollateral()
      )?.map((utxo) =>
        Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
      );
      if (!collateral || collateral.length <= 0) {
        throw new Error("NO_COLLATERAL");
      }

      collateral.slice(0, 2).forEach((coll) => {
        txBuilder.add_collateral(coll);
      });
    }
    let aux_data;
    if (metadata) {
      aux_data = Loader.Cardano.AuxiliaryData.new();
      const generalMetadata = Loader.Cardano.GeneralTransactionMetadata.new();
      Object.keys(metadata).forEach((label) => {
        Object.keys(metadata[label]).length > 0 &&
          generalMetadata.insert(
            Loader.Cardano.BigNum.from_str(label),
            Loader.Cardano.encode_json_str_to_metadatum(
              JSON.stringify(metadata[label]),
              1
            )
          );
      });
      aux_data.set_metadata(generalMetadata);
      txBuilder.set_auxiliary_data(aux_data);
    }

    const u = Loader.Cardano.TransactionUnspentOutputs.new();
    utxos.forEach((utxo) => {
      u.add(utxo);
    });

    txBuilder.add_inputs_from(u, changeAddress.to_address());
    txBuilder.balance(changeAddress.to_address());

    let tx = await txBuilder.construct(u, changeAddress.to_address());

    const witnessSetBuilder = Loader.Cardano.TransactionWitnessSetBuilder.new();
    witnessSetBuilder.add_existing(tx.witness_set());

    let txVkeyWitnesses = await window.cardano.selectedWallet.signTx(
      toHex(tx.to_bytes()),
      true
    );
    txVkeyWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
      fromHex(txVkeyWitnesses)
    );

    witnessSetBuilder.add_existing(txVkeyWitnesses);

    const signedTx = Loader.Cardano.Transaction.new(
      tx.body(),
      witnessSetBuilder.build(),
      tx.auxiliary_data()
    );

    console.log("Full Tx Size", signedTx.to_bytes().length);

    const txHash = await window.cardano.selectedWallet.submitTx(
      toHex(signedTx.to_bytes())
    );
    return txHash;
  }

  /**
   * @private
   */
  splitAmount(lovelaceAmount, address, outputs) {
    if (
      lovelaceAmount.compare(Loader.Cardano.BigNum.from_str("400000000")) ==
        1 ||
      lovelaceAmount.compare(Loader.Cardano.BigNum.from_str("400000000")) == 0
    ) {
      const [amount1, amount2, amount3] = [
        lovelacePercentage(lovelaceAmount, this.contractInfo.owner1.fee2),
        lovelacePercentage(lovelaceAmount, this.contractInfo.owner2.fee),
        lovelacePercentage(lovelaceAmount, this.contractInfo.extraFee),
      ];
      if (
        this.extraFeeRecipient.to_bech32() ==
        this.contractInfo.owner1.address.to_bech32() // if owner is same as fee recipient, no reason to split up utxo extra
      ) {
        outputs.add(
          this.createOutput(
            this.contractInfo.owner1.address,
            Loader.Cardano.Value.new(amount1.checked_add(amount3))
          )
        );
      } else {
        outputs.add(
          this.createOutput(
            this.contractInfo.owner1.address,
            Loader.Cardano.Value.new(amount1)
          )
        );
        outputs.add(
          this.createOutput(
            this.extraFeeRecipient,
            Loader.Cardano.Value.new(amount3)
          )
        );
      }

      outputs.add(
        this.createOutput(
          this.contractInfo.owner2.address,
          Loader.Cardano.Value.new(amount2)
        )
      );

      outputs.add(
        this.createOutput(
          address,
          Loader.Cardano.Value.new(
            lovelaceAmount
              .checked_sub(amount1)
              .checked_sub(amount2)
              .checked_sub(amount3)
          )
        )
      );
    } else {
      const amount1 = lovelacePercentage(
        lovelaceAmount,
        this.contractInfo.owner1.fee1
      );
      outputs.add(
        this.createOutput(
          this.contractInfo.owner1.address,
          Loader.Cardano.Value.new(amount1)
        )
      );
      outputs.add(
        this.createOutput(
          address,
          Loader.Cardano.Value.new(lovelaceAmount.checked_sub(amount1))
        )
      );
    }
  }

  async load() {
    await Loader.load();
    const p = await this.blockfrostRequest(`/epochs/latest/parameters`);
    this.protocolParameters = {
      linearFee: {
        minFeeA: p.min_fee_a.toString(),
        minFeeB: p.min_fee_b.toString(),
      },
      coinsPerUtxoByte: p.coins_per_utxo_size.toString(),
      poolDeposit: p.pool_deposit,
      keyDeposit: p.key_deposit,
      maxValSize: parseInt(p.max_val_size),
      maxTxSize: parseInt(p.max_tx_size),
      priceMem: parseFloat(p.price_mem),
      priceStep: parseFloat(p.price_step),
      maxCollateralInputs: parseInt(p.max_collateral_inputs),
      collateralPercentage: 0, // parseInt(p.collateral_percent),
      costModels: p.cost_models,
    };

    this.contractInfo = {
      policySpaceBudz:
        "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc",
      policyBid: "800df05a0cc6b6f0d28aaa1812135bd9eebfbf5e8e80fd47da9989eb",
      prefixSpaceBud: "SpaceBud",
      prefixSpaceBudBid: "SpaceBudBid",
      owner1: {
        address: Loader.Cardano.Address.from_bech32(
          "addr1qxpxm8a0uxe6eu2m6fgdu6wqfclujtzyjdu9jw0qdxfjaz02h5ngjz7fftac5twlxj6jha4meenh6476m5xdwmeyh4hq0zeknx"
        ),
        fee1: Loader.Cardano.BigNum.from_str("416"), // 2.4%
        fee2: Loader.Cardano.BigNum.from_str("625"), // 1.6%
      },
      owner2: {
        address: Loader.Cardano.Address.from_bech32(
          "addr1qxyzd8utq5d88ycqle6r57e32qn0gc2vuysk5ja5t4lapavecd72l0wcsvv6t3vgj097k6a5jr4lz5pppkkf6tp83s2q9sv7dv"
        ),
        fee: Loader.Cardano.BigNum.from_str("2500"), // 0.4%
      },
      extraFee: Loader.Cardano.BigNum.from_str("2500"), // 0.4%
      minPrice: Loader.Cardano.BigNum.from_str("70000000"),
      bidStep: Loader.Cardano.BigNum.from_str("10000"),
    };
    this.extraFeeRecipient = Loader.Cardano.Address.from_bech32(
      this.extraFeeRecipient
    );
  }

  /**
   *
   * @param {number} budId
   * @returns {TradeUtxo | TradeUtxo[] | undefined} Array if both twins are offered
   */
  async getOffer(budId) {
    const offerUtxo = await this.getUtxo(
      this.contractInfo.policySpaceBudz,
      this.contractInfo.prefixSpaceBud,
      budId.toString()
    );
    if (offerUtxo.length === 1) {
      const lovelace = getTradeDetails(offerUtxo[0].datum).requestedAmount;
      if (lovelace.compare(this.contractInfo.minPrice) == -1) return null;
      return { ...offerUtxo[0], lovelace: lovelace.to_str() };
    }
    if (offerUtxo.length === 2 && (budId == 1903 || budId == 6413)) {
      const utxos = offerUtxo
        .map((utxo) => {
          const lovelace = getTradeDetails(utxo.datum).requestedAmount;
          if (lovelace.compare(this.contractInfo.minPrice) == -1) return null;
          return { ...utxo, lovelace: lovelace.to_str() };
        })
        .filter((utxo) => utxo != null);
      // if both twins are offered, but one < minPrice filter it out and do not return an array
      // if both are < minPrice return null
      if (utxos.length <= 0) return null;
      if (utxos.length < 2) return utxos[0];
      return utxos;
    }

    return null;
  }

  async getAddress() {
    try {
      return Loader.Cardano.BaseAddress.from_address(
        Loader.Cardano.Address.from_bytes(
          fromHex((await window.cardano.selectedWallet.getUsedAddresses())[0])
        )
      );
    } catch (e) {}
    try {
      return Loader.Cardano.EnterpriseAddress.from_address(
        Loader.Cardano.Address.from_bytes(
          fromHex((await window.cardano.selectedWallet.getUsedAddresses())[0])
        )
      );
    } catch (e) {}
    try {
      return Loader.Cardano.PointerAddress.from_address(
        Loader.Cardano.Address.from_bytes(
          fromHex((await window.cardano.selectedWallet.getUsedAddresses())[0])
        )
      );
    } catch (e) {}
    throw Error("Not supported address type");
  }

  /**
   *
   * @param {number} budId
   * @returns {TradeUtxo}
   */
  async getBid(budId) {
    const bidUtxo = await this.getUtxo(
      this.contractInfo.policyBid,
      this.contractInfo.prefixSpaceBudBid,
      budId.toString()
    );
    if (bidUtxo.length !== 1) return null;
    const lovelace = bidUtxo[0].utxo.output().amount().coin().to_str();
    return { ...bidUtxo[0], lovelace };
  }

  /**
   * @param {TradeUtxo} bidUtxo
   * @param {string} bidAmount lovelace amount
   * @returns {string} Transaction Id
   */
  async bid(bidUtxo, bidAmount) {
    const { txBuilder, datums, metadata, outputs } = await this.initTx();
    const budId = bidUtxo.budId;

    const walletAddress = await this.getAddress();

    const utxos = (await window.cardano.selectedWallet.getUtxos()).map((utxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );
    datums.add(bidUtxo.datum);

    const bidDatum = BID({
      tradeOwner: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
      budId,
    });

    const datumType = parseInt(
      bidUtxo.datum.as_constr_plutus_data().alternative().to_str()
    );
    const value = bidUtxo.utxo.output().amount();
    if (datumType === DATUM_TYPE.StartBid) {
      if (
        Loader.Cardano.BigNum.from_str(bidAmount).compare(
          this.contractInfo.minPrice
        ) == -1
      )
        throw new Error("Amount too small");
      if (this.policyBidLength(value) > 1) {
        outputs.add(
          this.createOutput(
            CONTRACT_ADDRESS(),
            assetsToValue([
              { unit: "lovelace", quantity: bidAmount },
              {
                unit:
                  this.contractInfo.policyBid +
                  fromAscii(this.contractInfo.prefixSpaceBudBid + budId),
                quantity: "1",
              },
            ]),
            {
              datum: bidDatum,
              index: 0,
              tradeOwnerAddress: walletAddress,
              metadata,
            }
          )
        );
        datums.add(bidDatum);
        outputs.add(
          this.createOutput(
            CONTRACT_ADDRESS(),
            this.policyBidRemaining(bidUtxo.utxo.output().amount(), budId),
            {
              datum: START_BID(),
              index: 1,
              metadata,
            }
          )
        );
        datums.add(START_BID());
      } else {
        outputs.add(
          this.createOutput(
            CONTRACT_ADDRESS(),
            assetsToValue([
              { unit: "lovelace", quantity: bidAmount },
              {
                unit:
                  this.contractInfo.policyBid +
                  fromAscii(this.contractInfo.prefixSpaceBudBid + budId),
                quantity: "1",
              },
            ]),
            {
              datum: bidDatum,
              index: 0,
              tradeOwnerAddress: walletAddress,
              metadata,
            }
          )
        );
        datums.add(bidDatum);
      }
    } else if (datumType == DATUM_TYPE.Bid) {
      if (
        Loader.Cardano.BigNum.from_str(bidAmount).compare(
          this.contractInfo.bidStep.checked_add(value.coin())
        ) == -1
      )
        throw new Error("Amount too small");
      outputs.add(
        this.createOutput(
          CONTRACT_ADDRESS(),
          assetsToValue([
            { unit: "lovelace", quantity: bidAmount },
            {
              unit:
                this.contractInfo.policyBid +
                fromAscii(this.contractInfo.prefixSpaceBudBid + budId),
              quantity: "1",
            },
          ]),
          {
            datum: bidDatum,
            index: 0,
            tradeOwnerAddress: walletAddress,
            metadata,
          }
        )
      );
      datums.add(bidDatum);
      if (
        bidUtxo.tradeOwnerAddress.to_bech32() !=
        walletAddress.to_address().to_bech32()
      )
        // check if bidder is owner of utxo. if so, not necessary to pay back to you own address
        outputs.add(
          this.createOutput(
            bidUtxo.tradeOwnerAddress,
            Loader.Cardano.Value.new(value.coin())
          )
        );
      else {
        txBuilder.add_required_signer(
          walletAddress.payment_cred().to_keyhash()
        );
      }
    }

    const txHash = await this.finalizeTx({
      txBuilder,
      changeAddress: walletAddress,
      utxos,
      outputs,
      datums,
      metadata,
      scriptUtxo: bidUtxo.utxo,
      action: BID_HIGHER,
    });
    return txHash;
  }

  /**
   *
   * @param {TradeUtxo} bidUtxo
   * @returns {string} Transaction Id
   */
  async sell(bidUtxo) {
    const { txBuilder, datums, metadata, outputs } = await this.initTx();
    const budId = bidUtxo.budId;

    const walletAddress = await this.getAddress();

    const utxos = (await window.cardano.selectedWallet.getUtxos()).map((utxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );
    datums.add(bidUtxo.datum);

    const datumType = parseInt(
      bidUtxo.datum.as_constr_plutus_data().alternative().to_str()
    );
    const value = bidUtxo.utxo.output().amount();
    if (datumType !== DATUM_TYPE.Bid) throw new Error("Datum needs to be Bid");
    outputs.add(
      this.createOutput(
        CONTRACT_ADDRESS(),
        assetsToValue([
          {
            unit:
              this.contractInfo.policyBid +
              fromAscii(this.contractInfo.prefixSpaceBudBid + budId),
            quantity: "1",
          },
        ]),
        {
          datum: START_BID(),
          index: 0,
          metadata,
        }
      )
    );
    datums.add(START_BID());
    this.splitAmount(value.coin(), walletAddress.to_address(), outputs);
    outputs.add(
      this.createOutput(
        bidUtxo.tradeOwnerAddress,
        assetsToValue([
          {
            unit:
              this.contractInfo.policySpaceBudz +
              fromAscii(this.contractInfo.prefixSpaceBud + budId),
            quantity: "1",
          },
        ])
      )
    ); // bidder receiving SpaceBud

    txBuilder.add_required_signer(walletAddress.payment_cred().to_keyhash());

    const txHash = await this.finalizeTx({
      txBuilder,
      changeAddress: walletAddress,
      utxos,
      outputs,
      datums,
      metadata,
      scriptUtxo: bidUtxo.utxo,
      action: SELL,
    });
    return txHash;
  }

  /**
   *
   * @param {number} budId
   * @param {string} requestedAmount lovelace
   * @returns {string} Transaction Id
   */
  async offer(budId, requestedAmount) {
    const { txBuilder, datums, metadata, outputs } = await this.initTx();
    budId = budId.toString();
    if (
      Loader.Cardano.BigNum.from_str(requestedAmount).compare(
        this.contractInfo.minPrice
      ) == -1
    )
      throw new Error("Amount too small");
    const walletAddress = await this.getAddress();

    const utxos = (await window.cardano.selectedWallet.getUtxos()).map((utxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );
    const offerDatum = OFFER({
      tradeOwner: toHex(walletAddress.payment_cred().to_keyhash().to_bytes()),
      budId,
      requestedAmount,
    });
    outputs.add(
      this.createOutput(
        CONTRACT_ADDRESS(),
        assetsToValue([
          {
            unit:
              this.contractInfo.policySpaceBudz +
              fromAscii(this.contractInfo.prefixSpaceBud + budId),
            quantity: "1",
          },
        ]),
        {
          datum: offerDatum,
          index: 0,
          tradeOwnerAddress: walletAddress,
          metadata,
        }
      )
    );
    datums.add(offerDatum);

    const txHash = await this.finalizeTx({
      txBuilder,
      changeAddress: walletAddress,
      utxos,
      outputs,
      datums,
      metadata,
    });
    return txHash;
  }

  /**
   * @param {TradeUtxo} offerUtxo
   * @returns {string} Transaction Id
   */
  async buy(offerUtxo) {
    const { txBuilder, datums, outputs } = await this.initTx();
    const walletAddress = await this.getAddress();

    const utxos = (await window.cardano.selectedWallet.getUtxos()).map((utxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );
    datums.add(offerUtxo.datum);

    const datumType = parseInt(
      offerUtxo.datum.as_constr_plutus_data().alternative().to_str()
    );
    const tradeDetails = getTradeDetails(offerUtxo.datum);
    const value = offerUtxo.utxo.output().amount();
    const lovelaceAmount = tradeDetails.requestedAmount;
    if (datumType !== DATUM_TYPE.Offer)
      throw new Error("Datum needs to be Offer");
    this.splitAmount(lovelaceAmount, offerUtxo.tradeOwnerAddress, outputs);

    outputs.add(this.createOutput(walletAddress.to_address(), value)); // buyer receiving SpaceBud

    txBuilder.add_required_signer(walletAddress.payment_cred().to_keyhash());

    const txHash = await this.finalizeTx({
      txBuilder,
      changeAddress: walletAddress,
      utxos,
      outputs,
      datums,
      scriptUtxo: offerUtxo.utxo,
      action: BUY,
    });
    return txHash;
  }

  /**
   * @param {TradeUtxo} offerUtxo
   * @returns {string} Transaction Id
   */
  async cancelOffer(offerUtxo) {
    const { txBuilder, datums, outputs } = await this.initTx();

    const walletAddress = await this.getAddress();

    const utxos = (await window.cardano.selectedWallet.getUtxos()).map((utxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );
    datums.add(offerUtxo.datum);

    const datumType = parseInt(
      offerUtxo.datum.as_constr_plutus_data().alternative().to_str()
    );
    const value = offerUtxo.utxo.output().amount();
    if (datumType !== DATUM_TYPE.Offer)
      throw new Error("Datum needs to be Offer");
    txBuilder.add_required_signer(getTradeDetails(offerUtxo.datum).tradeOwner);

    const txHash = await this.finalizeTx({
      txBuilder,
      changeAddress: walletAddress,
      utxos,
      outputs,
      datums,
      scriptUtxo: offerUtxo.utxo,
      action: CANCEL,
    });
    return txHash;
  }

  /**
   * @param {TradeUtxo} bidUtxo
   * @returns {string} Transaction Id
   */
  async cancelBid(bidUtxo) {
    const { txBuilder, datums, metadata, outputs } = await this.initTx();
    const budId = bidUtxo.budId;
    const walletAddress = await this.getAddress();

    const utxos = (await window.cardano.selectedWallet.getUtxos()).map((utxo) =>
      Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
    );
    datums.add(bidUtxo.datum);

    const datumType = parseInt(
      bidUtxo.datum.as_constr_plutus_data().alternative().to_str()
    );
    const value = bidUtxo.utxo.output().amount();
    if (datumType !== DATUM_TYPE.Bid) throw new Error("Datum needs to be Bid");
    outputs.add(
      this.createOutput(
        CONTRACT_ADDRESS(),
        assetsToValue([
          {
            unit:
              this.contractInfo.policyBid +
              fromAscii(this.contractInfo.prefixSpaceBudBid + budId),
            quantity: "1",
          },
        ]),
        {
          datum: START_BID(),
          index: 0,
          metadata,
        }
      )
    );
    datums.add(START_BID());
    txBuilder.add_required_signer(getTradeDetails(bidUtxo.datum).tradeOwner);

    const txHash = await this.finalizeTx({
      txBuilder,
      changeAddress: walletAddress,
      utxos,
      outputs,
      datums,
      metadata,
      scriptUtxo: bidUtxo.utxo,
      action: CANCEL,
    });
    return txHash;
  }

  /**
   *
   * @param {string} txHash Transaction Id
   * @returns
   */
  async awaitConfirmation(txHash) {
    return new Promise((res, rej) => {
      const confirmation = setInterval(async () => {
        const isConfirmed = await this.blockfrostRequest(`/txs/${txHash}`);
        if (isConfirmed && !isConfirmed.error) {
          clearInterval(confirmation);
          res(txHash);
          return;
        }
      }, 5000);
    });
  }
}

export default SpaceBudzMarket;
