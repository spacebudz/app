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
import { languageViews } from "./languageViews.js";
import { contract } from "./plutus.js";
import CoinSelection from "./coinSelection.js";
import {
  Address,
  PlutusData,
  TransactionUnspentOutput,
} from "./custom_modules/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib.js";

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
      Loader.Cardano.Int.new_i32(DATUM_TYPE.StartBid),
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
        Loader.Cardano.Int.new_i32(0),
        fieldsInner
      )
    )
  );
  const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.Int.new_i32(DATUM_TYPE.Bid),
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
        Loader.Cardano.Int.new_i32(0),
        fieldsInner
      )
    )
  );
  const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
    Loader.Cardano.ConstrPlutusData.new(
      Loader.Cardano.Int.new_i32(DATUM_TYPE.Offer),
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
      Loader.Cardano.Int.new_i32(0),
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
      Loader.Cardano.Int.new_i32(1),
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
      Loader.Cardano.Int.new_i32(2),
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
      Loader.Cardano.Int.new_i32(3),
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

    const utxos = await this.blockfrostRequest(
      `/addresses/${CONTRACT_ADDRESS().to_bech32()}/utxos/${asset}`
    );

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
          if (datum != toHex(START_BID().to_bytes()))
            //STARTBID doesn't have a tradeOwner
            tradeOwnerAddress = metadata
              .find((m) => m.label == ADDRESS_LABEL)
              .json_metadata.address.slice(2);
        } catch (e) {
          throw new Error("Some required metadata entries were not found");
        }
        datum = Loader.Cardano.PlutusData.from_bytes(fromHex(datum));
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
              utxo.output_index
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
    const txBuilder = Loader.Cardano.TransactionBuilder.new(
      Loader.Cardano.LinearFee.new(
        Loader.Cardano.BigNum.from_str(
          this.protocolParameters.linearFee.minFeeA
        ),
        Loader.Cardano.BigNum.from_str(
          this.protocolParameters.linearFee.minFeeB
        )
      ),
      Loader.Cardano.BigNum.from_str(this.protocolParameters.minUtxo),
      Loader.Cardano.BigNum.from_str(this.protocolParameters.poolDeposit),
      Loader.Cardano.BigNum.from_str(this.protocolParameters.keyDeposit),
      this.protocolParameters.maxValSize,
      this.protocolParameters.maxTxSize,
      this.protocolParameters.priceMem,
      this.protocolParameters.priceStep,
      Loader.Cardano.LanguageViews.new(Buffer.from(languageViews, "hex"))
    );
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
    const v = value;
    const minAda = Loader.Cardano.min_ada_required(
      v,
      Loader.Cardano.BigNum.from_str(this.protocolParameters.minUtxo),
      datum && Loader.Cardano.hash_plutus_data(datum)
    );
    if (minAda.compare(v.coin()) == 1) v.set_coin(minAda);
    const output = Loader.Cardano.TransactionOutput.new(address, v);
    if (datum) {
      output.set_data_hash(Loader.Cardano.hash_plutus_data(datum));
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
  setCollateral(txBuilder, utxos) {
    const inputs = Loader.Cardano.TransactionInputs.new();
    utxos.forEach((utxo) => {
      inputs.add(utxo.input());
      txBuilder.add_address_witness(utxo.output().address());
    });
    txBuilder.set_collateral(inputs);
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
    const transactionWitnessSet = Loader.Cardano.TransactionWitnessSet.new();
    let { input, change } = CoinSelection.randomImprove(
      utxos,
      outputs,
      8,
      scriptUtxo ? [scriptUtxo] : []
    );
    input.forEach((utxo) => {
      txBuilder.add_input(
        utxo.output().address(),
        utxo.input(),
        utxo.output().amount()
      );
    });
    for (let i = 0; i < outputs.len(); i++) {
      txBuilder.add_output(outputs.get(i));
    }
    if (scriptUtxo) {
      const redeemers = Loader.Cardano.Redeemers.new();
      const redeemerIndex = txBuilder
        .index_of_input(scriptUtxo.input())
        .toString();
      redeemers.add(action(redeemerIndex));
      txBuilder.set_redeemers(
        Loader.Cardano.Redeemers.from_bytes(redeemers.to_bytes())
      );
      txBuilder.set_plutus_data(
        Loader.Cardano.PlutusList.from_bytes(datums.to_bytes())
      );
      txBuilder.set_plutus_scripts(CONTRACT());
      const collateral = (
        await window.cardano.selectedWallet.experimental.getCollateral()
      ).map((utxo) =>
        Loader.Cardano.TransactionUnspentOutput.from_bytes(fromHex(utxo))
      );
      if (collateral.length <= 0) throw new Error("NO_COLLATERAL");
      this.setCollateral(txBuilder, collateral);

      transactionWitnessSet.set_plutus_scripts(CONTRACT());
      transactionWitnessSet.set_plutus_data(datums);
      transactionWitnessSet.set_redeemers(redeemers);
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

    const changeMultiAssets = change.multiasset();

    // check if change value is too big for single output
    if (
      changeMultiAssets &&
      change.to_bytes().length * 2 > this.protocolParameters.maxValSize
    ) {
      const partialChange = Loader.Cardano.Value.new(
        Loader.Cardano.BigNum.from_str("0")
      );

      const partialMultiAssets = Loader.Cardano.MultiAsset.new();
      const policies = changeMultiAssets.keys();
      const makeSplit = () => {
        for (let j = 0; j < changeMultiAssets.len(); j++) {
          const policy = policies.get(j);
          const policyAssets = changeMultiAssets.get(policy);
          const assetNames = policyAssets.keys();
          const assets = Loader.Cardano.Assets.new();
          for (let k = 0; k < assetNames.len(); k++) {
            const policyAsset = assetNames.get(k);
            const quantity = policyAssets.get(policyAsset);
            assets.insert(policyAsset, quantity);
            //check size
            const checkMultiAssets = Loader.Cardano.MultiAsset.from_bytes(
              partialMultiAssets.to_bytes()
            );
            checkMultiAssets.insert(policy, assets);
            const checkValue = Loader.Cardano.Value.new(
              Loader.Cardano.BigNum.from_str("0")
            );
            checkValue.set_multiasset(checkMultiAssets);
            if (
              checkValue.to_bytes().length * 2 >=
              this.protocolParameters.maxValSize
            ) {
              partialMultiAssets.insert(policy, assets);
              return;
            }
          }
          partialMultiAssets.insert(policy, assets);
        }
      };
      makeSplit();
      partialChange.set_multiasset(partialMultiAssets);
      const minAda = Loader.Cardano.min_ada_required(
        partialChange,
        Loader.Cardano.BigNum.from_str(this.protocolParameters.minUtxo)
      );
      partialChange.set_coin(minAda);

      txBuilder.add_output(
        Loader.Cardano.TransactionOutput.new(
          changeAddress.to_address(),
          partialChange
        )
      );
    }

    txBuilder.add_change_if_needed(changeAddress.to_address());
    const txBody = txBuilder.build();
    const tx = Loader.Cardano.Transaction.new(
      txBody,
      Loader.Cardano.TransactionWitnessSet.from_bytes(
        transactionWitnessSet.to_bytes()
      ),
      aux_data
    );
    const size = tx.to_bytes().length * 2;
    console.log(size);
    if (size > this.protocolParameters.maxTxSize)
      throw new Error("MAX_SIZE_REACHED");
    let txVkeyWitnesses = await window.cardano.selectedWallet.signTx(
      toHex(tx.to_bytes()),
      true
    );
    txVkeyWitnesses = Loader.Cardano.TransactionWitnessSet.from_bytes(
      fromHex(txVkeyWitnesses)
    );
    transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
    const signedTx = Loader.Cardano.Transaction.new(
      tx.body(),
      transactionWitnessSet,
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
      minUtxo: "1000000",
      poolDeposit: p.pool_deposit,
      keyDeposit: p.key_deposit,
      maxValSize: parseInt(p.max_val_size),
      maxTxSize: parseInt(p.max_tx_size),
      priceMem: parseFloat(p.price_mem),
      priceStep: parseFloat(p.price_step),
    };
    //TODO: wait for blockfrost fix
    // this.protocolParameters = {
    //   linearFee: {
    //     minFeeA: p.min_fee_a.toString(),
    //     minFeeB: p.min_fee_b.toString(),
    //   },
    //   minUtxo: "1000000",
    //   poolDeposit: "500000000",
    //   keyDeposit: "2000000",
    //   maxValSize: "5000",
    //   maxTxSize: 16384,
    //   priceMem: 5.77e-2,
    //   priceStep: 7.21e-5,
    // };

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

    CoinSelection.setProtocolParameters(
      this.protocolParameters.minUtxo,
      this.protocolParameters.linearFee.minFeeA,
      this.protocolParameters.linearFee.minFeeB,
      this.protocolParameters.maxTxSize.toString()
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

    const datumType = bidUtxo.datum.as_constr_plutus_data().tag().as_i32();
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
        const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
        requiredSigners.add(walletAddress.payment_cred().to_keyhash());
        txBuilder.set_required_signers(requiredSigners);
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

    const datumType = bidUtxo.datum.as_constr_plutus_data().tag().as_i32();
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

    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(walletAddress.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

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

    const datumType = offerUtxo.datum.as_constr_plutus_data().tag().as_i32();
    const tradeDetails = getTradeDetails(offerUtxo.datum);
    const value = offerUtxo.utxo.output().amount();
    const lovelaceAmount = tradeDetails.requestedAmount;
    if (datumType !== DATUM_TYPE.Offer)
      throw new Error("Datum needs to be Offer");
    this.splitAmount(lovelaceAmount, offerUtxo.tradeOwnerAddress, outputs);

    outputs.add(this.createOutput(walletAddress.to_address(), value)); // buyer receiving SpaceBud

    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(walletAddress.payment_cred().to_keyhash());
    txBuilder.set_required_signers(requiredSigners);

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

    const datumType = offerUtxo.datum.as_constr_plutus_data().tag().as_i32();
    const value = offerUtxo.utxo.output().amount();
    if (datumType !== DATUM_TYPE.Offer)
      throw new Error("Datum needs to be Offer");
    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(getTradeDetails(offerUtxo.datum).tradeOwner);
    txBuilder.set_required_signers(requiredSigners);

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

    const datumType = bidUtxo.datum.as_constr_plutus_data().tag().as_i32();
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
    const requiredSigners = Loader.Cardano.Ed25519KeyHashes.new();
    requiredSigners.add(getTradeDetails(bidUtxo.datum).tradeOwner);
    txBuilder.set_required_signers(requiredSigners);

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
