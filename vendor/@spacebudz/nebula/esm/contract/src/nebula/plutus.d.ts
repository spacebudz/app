import { Validator } from "lucid-cardano";
export interface NebulaSpend {
    new (protocolKey: string | null, royaltyToken: {
        policyId: string;
        assetName: string;
    }): Validator;
    datum: {
        Listing: [
            {
                owner: {
                    paymentCredential: {
                        VerificationKeyCredential: [string];
                    } | {
                        ScriptCredential: [string];
                    };
                    stakeCredential: {
                        Inline: [
                            {
                                VerificationKeyCredential: [string];
                            } | {
                                ScriptCredential: [string];
                            }
                        ];
                    } | {
                        Pointer: {
                            slotNumber: bigint;
                            transactionIndex: bigint;
                            certificateIndex: bigint;
                        };
                    } | null;
                };
                requestedLovelace: bigint;
                privateListing: {
                    paymentCredential: {
                        VerificationKeyCredential: [string];
                    } | {
                        ScriptCredential: [string];
                    };
                    stakeCredential: {
                        Inline: [
                            {
                                VerificationKeyCredential: [string];
                            } | {
                                ScriptCredential: [string];
                            }
                        ];
                    } | {
                        Pointer: {
                            slotNumber: bigint;
                            transactionIndex: bigint;
                            certificateIndex: bigint;
                        };
                    } | null;
                } | null;
            }
        ];
    } | {
        Bid: [
            {
                owner: {
                    paymentCredential: {
                        VerificationKeyCredential: [string];
                    } | {
                        ScriptCredential: [string];
                    };
                    stakeCredential: {
                        Inline: [
                            {
                                VerificationKeyCredential: [string];
                            } | {
                                ScriptCredential: [string];
                            }
                        ];
                    } | {
                        Pointer: {
                            slotNumber: bigint;
                            transactionIndex: bigint;
                            certificateIndex: bigint;
                        };
                    } | null;
                };
                requestedOption: {
                    SpecificValue: [Map<string, Map<string, bigint>>];
                } | {
                    SpecificPolicyIdWithConstraints: [
                        string,
                        Array<string>,
                        Array<{
                            Included: [string];
                        } | {
                            Excluded: [string];
                        }> | null
                    ];
                };
            }
        ];
    };
    action: "Sell" | "Buy" | "Cancel";
}
export declare const NebulaSpend: NebulaSpend;
export interface OneshotMint {
    new (outputReference: {
        transactionId: {
            hash: string;
        };
        outputIndex: bigint;
    }): Validator;
    _redeemer: undefined;
}
export declare const OneshotMint: OneshotMint;
