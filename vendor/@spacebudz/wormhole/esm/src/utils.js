import { getAddressDetails } from "../deps.js";
export function fromAddress(address) {
    // We do not support pointer addresses!
    const { paymentCredential, stakeCredential } = getAddressDetails(address);
    if (!paymentCredential)
        throw new Error("Not a valid payment address.");
    return {
        paymentCredential: paymentCredential?.type === "Key"
            ? {
                PublicKeyCredential: [paymentCredential.hash],
            }
            : { ScriptCredential: [paymentCredential.hash] },
        stakeCredential: stakeCredential
            ? {
                Inline: [
                    stakeCredential.type === "Key"
                        ? {
                            PublicKeyCredential: [stakeCredential.hash],
                        }
                        : { ScriptCredential: [stakeCredential.hash] },
                ],
            }
            : null,
    };
}
export function toAddress(address, lucid) {
    const paymentCredential = (() => {
        if ("PublicKeyCredential" in address.paymentCredential) {
            return lucid.utils.keyHashToCredential(address.paymentCredential.PublicKeyCredential[0]);
        }
        else {
            return lucid.utils.scriptHashToCredential(address.paymentCredential.ScriptCredential[0]);
        }
    })();
    const stakeCredential = (() => {
        if (!address.stakeCredential)
            return undefined;
        if ("Inline" in address.stakeCredential) {
            if ("PublicKeyCredential" in address.stakeCredential.Inline[0]) {
                return lucid.utils.keyHashToCredential(address.stakeCredential.Inline[0].PublicKeyCredential[0]);
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
