import { C, fromText, getAddressDetails, Lucid, toLabel, } from "../deps.js";
const lucid = await Lucid.new();
export function idToBud(id) {
    return toLabel(222) + fromText(`Bud${id}`);
}
export function colorToBerry(color) {
    return fromText(`Berry${color}`);
}
export function idToMatrix(id) {
    return toLabel(222) + fromText(`Matrix${id}`);
}
export function sortDesc(a, b) {
    if (a.assets.lovelace > b.assets.lovelace) {
        return -1;
    }
    else if (a.assets.lovelace < b.assets.lovelace) {
        return 1;
    }
    else {
        return 0;
    }
}
export function sortAsc(a, b) {
    if (a.assets.lovelace > b.assets.lovelace) {
        return 1;
    }
    else if (a.assets.lovelace < b.assets.lovelace) {
        return -1;
    }
    else {
        return 0;
    }
}
export function toOwner({ address, data }) {
    const { paymentCredential } = getAddressDetails(address || toAddress(data, lucid));
    if (paymentCredential?.type === "Key") {
        return C.Ed25519KeyHash.from_hex(paymentCredential.hash).to_bech32("addr_vkh");
    }
    else if (paymentCredential?.type === "Script") {
        return C.ScriptHash.from_hex(paymentCredential.hash).to_bech32("script");
    }
    return "";
}
export function fromAddress(address) {
    // We do not support pointer addresses!
    const { paymentCredential, stakeCredential } = getAddressDetails(address);
    if (!paymentCredential)
        throw new Error("Not a valid payment address.");
    return {
        paymentCredential: paymentCredential?.type === "Key"
            ? {
                VerificationKeyCredential: [paymentCredential.hash],
            }
            : { ScriptCredential: [paymentCredential.hash] },
        stakeCredential: stakeCredential
            ? {
                Inline: [
                    stakeCredential.type === "Key"
                        ? {
                            VerificationKeyCredential: [stakeCredential.hash],
                        }
                        : { ScriptCredential: [stakeCredential.hash] },
                ],
            }
            : null,
    };
}
export function toAddress(address, lucid) {
    const paymentCredential = (() => {
        if ("VerificationKeyCredential" in address.paymentCredential) {
            return lucid.utils.keyHashToCredential(address.paymentCredential.VerificationKeyCredential[0]);
        }
        else {
            return lucid.utils.scriptHashToCredential(address.paymentCredential.ScriptCredential[0]);
        }
    })();
    const stakeCredential = (() => {
        if (!address.stakeCredential)
            return undefined;
        if ("Inline" in address.stakeCredential) {
            if ("VerificationKeyCredential" in address.stakeCredential.Inline[0]) {
                return lucid.utils.keyHashToCredential(address.stakeCredential.Inline[0].VerificationKeyCredential[0]);
            }
            else {
                return lucid.utils.scriptHashToCredential(address.stakeCredential.Inline[0].ScriptCredential[0]);
            }
        }
        else {
            return undefined;
        }
    })();
    return lucid.utils.credentialToAddress(paymentCredential, stakeCredential);
}
export function fromAssets(assets) {
    const value = new Map();
    if (assets.lovelace)
        value.set("", new Map([["", assets.lovelace]]));
    const units = Object.keys(assets);
    const policies = Array.from(new Set(units
        .filter((unit) => unit !== "lovelace")
        .map((unit) => unit.slice(0, 56))));
    policies.sort().forEach((policyId) => {
        const policyUnits = units.filter((unit) => unit.slice(0, 56) === policyId);
        const assetsMap = new Map();
        policyUnits.sort().forEach((unit) => {
            assetsMap.set(unit.slice(56), assets[unit]);
        });
        value.set(policyId, assetsMap);
    });
    return value;
}
export function toAssets(value) {
    const result = { lovelace: value.get("")?.get("") || 0n };
    for (const [policyId, assets] of value) {
        if (policyId === "")
            continue;
        for (const [assetName, amount] of assets) {
            result[policyId + assetName] = amount;
        }
    }
    return result;
}
export function checkVariableFee(fee) {
    if (fee <= 0)
        throw new Error("Variable fee needs to be greater than 0.");
    return BigInt(Math.floor(1 / (fee / 10)));
}
