import { Buffer } from "buffer";
import {
  BigNum,
  PlutusData,
} from "./custom_modules/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib";
import Loader from "./loader.js";

export const fromHex = (hex) => Buffer.from(hex, "hex");
export const toHex = (bytes) => Buffer.from(bytes).toString("hex");
export const toBytesNum = (num) =>
  num
    .toString()
    .split("")
    .map((d) => "3" + d)
    .join("");
export const fromAscii = (hex) => Buffer.from(hex).toString("hex");

export const assetsToValue = (assets) => {
  const multiAsset = Loader.Cardano.MultiAsset.new();
  const lovelace = assets.find((asset) => asset.unit === "lovelace");
  const policies = [
    ...new Set(
      assets
        .filter((asset) => asset.unit !== "lovelace")
        .map((asset) => asset.unit.slice(0, 56))
    ),
  ];
  policies.forEach((policy) => {
    const policyAssets = assets.filter(
      (asset) => asset.unit.slice(0, 56) === policy
    );
    const assetsValue = Loader.Cardano.Assets.new();
    policyAssets.forEach((asset) => {
      assetsValue.insert(
        Loader.Cardano.AssetName.new(Buffer.from(asset.unit.slice(56), "hex")),
        Loader.Cardano.BigNum.from_str(asset.quantity)
      );
    });
    multiAsset.insert(
      Loader.Cardano.ScriptHash.from_bytes(Buffer.from(policy, "hex")),
      assetsValue
    );
  });
  const value = Loader.Cardano.Value.new(
    Loader.Cardano.BigNum.from_str(lovelace ? lovelace.quantity : "0")
  );
  if (assets.length > 1 || !lovelace) value.set_multiasset(multiAsset);
  return value;
};

export const valueToAssets = (value) => {
  const assets = [];
  assets.push({ unit: "lovelace", quantity: value.coin().to_str() });
  if (value.multiasset()) {
    const multiAssets = value.multiasset().keys();
    for (let j = 0; j < multiAssets.len(); j++) {
      const policy = multiAssets.get(j);
      const policyAssets = value.multiasset().get(policy);
      const assetNames = policyAssets.keys();
      for (let k = 0; k < assetNames.len(); k++) {
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        const asset =
          Buffer.from(policy.to_bytes(), "hex").toString("hex") +
          Buffer.from(policyAsset.name(), "hex").toString("hex");
        assets.push({
          unit: asset,
          quantity: quantity.to_str(),
        });
      }
    }
  }
  return assets;
};

/**
 *
 * @param {PlutusData} datum
 */
export const getTradeDetails = (datum) => {
  const tradeDetails = datum
    .as_constr_plutus_data()
    .data()
    .get(0)
    .as_constr_plutus_data()
    .data();
  return {
    tradeOwner: Loader.Cardano.Ed25519KeyHash.from_bytes(
      tradeDetails.get(0).as_bytes()
    ),
    budId: toHex(tradeDetails.get(1).as_bytes()),
    requestedAmount: tradeDetails.get(2).as_integer().as_u64(),
  };
};

/**
 *
 * @param {BigNum} amount
 * @param {BigNum} p
 */
export const lovelacePercentage = (amount, p) => {
  return amount
    .checked_mul(Loader.Cardano.BigNum.from_str("10"))
    .checked_div(p);
};
