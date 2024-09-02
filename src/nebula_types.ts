import { applyParamsToScript, Validator } from "lucid-cardano";
export interface NebulaSpend {
    new (
        protocolKey: string | null,
        royaltyToken: { policyId: string; assetName: string },
    ): Validator;
    datum: {
        Listing: [
            {
                owner: {
                    paymentCredential:
                        | { VerificationKeyCredential: [string] }
                        | {
                            ScriptCredential: [string];
                        };
                    stakeCredential: {
                        Inline: [
                            { VerificationKeyCredential: [string] } | {
                                ScriptCredential: [string];
                            },
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
                    paymentCredential:
                        | { VerificationKeyCredential: [string] }
                        | {
                            ScriptCredential: [string];
                        };
                    stakeCredential: {
                        Inline: [
                            { VerificationKeyCredential: [string] } | {
                                ScriptCredential: [string];
                            },
                        ];
                    } | {
                        Pointer: {
                            slotNumber: bigint;
                            transactionIndex: bigint;
                            certificateIndex: bigint;
                        };
                    } | null;
                } | null;
            },
        ];
    } | {
        Bid: [
            {
                owner: {
                    paymentCredential:
                        | { VerificationKeyCredential: [string] }
                        | {
                            ScriptCredential: [string];
                        };
                    stakeCredential: {
                        Inline: [
                            { VerificationKeyCredential: [string] } | {
                                ScriptCredential: [string];
                            },
                        ];
                    } | {
                        Pointer: {
                            slotNumber: bigint;
                            transactionIndex: bigint;
                            certificateIndex: bigint;
                        };
                    } | null;
                };
                requestedOption:
                    | { SpecificValue: [Map<string, Map<string, bigint>>] }
                    | {
                        SpecificPolicyIdWithConstraints: [
                            string,
                            Array<string>,
                            Array<
                                { Included: [string] } | { Excluded: [string] }
                            > | null,
                        ];
                    };
            },
        ];
    };
    action: "Sell" | "Buy" | "Cancel";
}

export const NebulaSpend = Object.assign(
    function (
        protocolKey: string | null,
        royaltyToken: { policyId: string; assetName: string },
    ) {
        return {
            type: "PlutusV2",
            script: applyParamsToScript(
                "591471010000323232323232323232323222222533300832323232323232323232323232323232323232323232323232323232323253330263370e002900009919191929998151980480f01389919191919191919191919191919191999111919299981f19b87001480004c8c8cdd79ba63014001374c602866604a00e6606e607000a90000031bab30460013036002132533303f3370e0049001099191919191929998250018a99982299b8730483754002900109919191919191919299982699b8f00d005100114a0a666098a66609866609866e3c00522104000643b0004a09444ccc130cdc7800a44104001f4d70004a0944528099982619b8f00148810400258a50004a09445281980b800a40106eb8c144004c144008dd718278009bac304e001303e3253330473370e900018251baa001100115330494912a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163301830130012323371e0020106eb8c138004ccc0a8030cc0f0c0f4029200000b007007304b001304b0023758609200260920046eb8c11c004c0dc00c0044c8c8c8c8c8c8c8c8c8c8c8c8c8c8c8cc138c94ccc138cdc3800a40002646464646464a6660b260b80042660aa660a400a4646493182d0011bae305800149854cc159241364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016305a001305a002375a60b000260b00046eacc158004c11800854cc1412412b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016305037540026464660a06609a002464931bae0013232323232533305453330545333054005100414a020022940400852819b8f01400c3330523371e002910104000643b0004a0944cc07402120083253330513370e00290010a5113253330523370e004900009919299982c800899baf374e00c6e9d2f5c00066eb0c168004c12803c0044c8c8cc06c0048c94ccc154cdc3800a40002646466042012466e3c004008dd7182e80098268010991919982b99810804919b8f0010024a0944dd7182e8009826801182b9baa001375860b2002609201c60a66ea80354ccc15003852889980c807119b8f0010033758646400260ac002608c64a66609e66e1d20003052375400220022a660a29212a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163303837566608a608c00490002450674726169747300375c646400260aa002608a64a66609c66e1d20003051375400220022a660a092012a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e001633037375666088608a0029000245047479706500330350133304330443304330440014800920043052001304232533304b3370e900018271baa0011001153304d4912a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163303f37586608260840229001119b873330383756660846086660846086002900124004008664466e2800800522104000643b000332233371800266e04dc68010008010012401090011bae30500013050002375c609c0026eb0c134004c0f4c94ccc118cdc3a400060926ea8004400454cc12124012a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163301730120012323371e0020106eb8c134004ccc0a402ccc0ecc0f0025200000a304a001304a0023758609000260900046eb8c118004c0d8008c100dd500099819981a000a400405a0560246002002444a66607e00429444c8c94ccc0f0c00c0084ccc01401400400c528182180198208011800800911299981e8010a5013232533303a300300214a2266600a00a00200660820066eb8c0fc00888ccdc624000002004466644466600e006004002002444666444666010006004002004444660806e9ccc100dd4803198201ba900333040375000497ae00010014bd7018008009111299981d001880089919191919980300080119998040040018030029bae303b003375a6076004607c008607800660020024444a666070006200226464646466600c002004666601001000600c00a6eb8c0e400cdd5981c801181e002181d0019800800911299981a801099ba5480092f5c026464a6660646006004266e95200033038374e00497ae0133300500500100330390033758606e0044640026644660080040020029101003001001222533303200214bd6f7b630099191919299981899b8f0050011003133037337606ea4004dd30011998038038018029bae303300337566066004606c00660680042940c084c94ccc0a8cdc3a4000605a6ea8004400454cc0b12412a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e0016333300b01d01b001025301037566603e60406603e6040036900124004605c002603ca66604c66e1d20023029375404220422a6605092012a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e0016153330263370e00290010991919191919299981629998161980581001488008a5013333222233712002603066602a0086604e6050004900000181000f0028010a503232533302d3370e00290000991919805811800981a80098128010a51302f375400266044604600890021bad3031001302132533302a3370e900018169baa0011001153302c49012a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e0016333300b01d01b001025375a6603e604000290011817000980f299981319b8748000c0a4dd501088108a9981424812a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00161323300301b0013253330273370e002900009919198101810800a4000605e002603e0442646466040604200290001817800980f81118149baa0213028375403e446464a66605066e1c00520001323233007375866042604400c90080009bae303000130200021323233223232533302e3370e0029000099251302600214a060606ea8004cc084dd61981198120012400046464a66605e66e1c00520001324a0604e0042646466e3c018004dd7181b800981380118189baa00133024302533024302533024302500148009200048000018004dd71818000981000118151baa0013301d301e00148000c0040048894ccc0a800852809919299981399b8f00200314a2266600a00a002006605c0066eb8c0b000888c94ccc090cdc3800a4000264646600c6eb0cc074c07801520042323253330293370e00290000991919b8f006001375c606200260420042940c0acdd50009980f180f9980f180f800a400090001bae302c001301c00214a2604c6ea8004c0040048894ccc09c00852809919299981218018010a511333005005001003302b00330290022222323232330263253330263370e002900009919191919192999818981a0010998169981500291981719299981719b87001480004c8c8c8c8c8c8c8c94ccc0ecc0f80084cc0dcc94ccc0dccdc3800a4000264646464a666080608600426607864a66607866e1c00520001323253330433046002149854cc1012401364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016375c608800260680082a66607866e1c00520021323253330433046002149854cc1012401364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016375c608800260680082a6607c9212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016303e37540066607864a66607866e1c00520001323253330433046002149854cc101241364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016304400130340021533303c3370e00290010a4c2a6607c9212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016303e3754002930a9981ea481364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e206974206578706563746564001630410013041002303f001302f00815330394912b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e7400163039375400e6606e64a66606e66e1c005200013232533303e3041002149854cc0ed241364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016303f001302f004153330373370e00290010a4c2a660729212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016303937540066606e64a66606e66e1c005200013232533303e3041002149854cc0ed241364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016303f001302f002153330373370e00290010a4c2a660729212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e74001630393754002930a9981c2481364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e2069742065787065637465640016303c001303c002303a001303a002375a60700026070004606c002604c0042a660609212b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016303037540029324c2a6605c921364c6973742f5475706c652f436f6e73747220636f6e7461696e73206d6f7265206974656d73207468616e206974206578706563746564001630320013032002375a606000260600046eb0c0b8004c07800854cc0a12412b436f6e73747220696e64657820646964206e6f74206d6174636820616e7920747970652076617269616e740016302837540026666601000e6eb0cc070c07400520000060050053300d0063301b301c3301b301c001480092004302a001301a3253330233370e900018131baa0011001153302549012a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163301737586603260340089001119b8733301037566603460366603460360029001240046eb8cc068c06c0092000375c6603460360049001240046002002444444a66604e008266e95200033028375000297ae0132323232325333027001133333300b00b00a0040080073370200c004266e9520024bd7019b89001300e33300b0093301d301e0044800001cc8cc88c94ccc0a4cdc3800a400026464a66605666e2000401440044014dd698188009810801080198159baa0010013301d301e00448018cc88c94ccc0a0cdc3800a400026464a66605466e2001400440044014dd698180009810001080198151baa0010013301c301d00348010cdc199b8200448050dd69980d980e00124004605600a605200844464a6660480022c264a66604a0022646eaccc060c064005200230270021630270013300437586602a602c00690021299980f99baf3301630170014800000c4cdd79980b180b800a400866e952004330250024bd700a503001001222533302100214bd7009919299980f18018010998120011998028028008018999802802800801981280198118011199803000a441004881002232533301a3370e00290000b0a99980d19b87001480084c8c8c8c8004c090004c050c94ccc074cdc3a400060406ea8004400454cc07d2412a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e001633006375666026602800a900a0009bae302200130120021323200130220013012002301c375400244660060040026002002444a666038004266e9520024bd70099191919299980d99b8f00500113374a90001981080125eb804ccc01c01c00c014dd7180e801980e8011810001980f0011111919199119299980d99b870014800840084c8c8004dd698118009809801980e9baa00200148000cc88c94ccc068cdc3800a4004266e9520024bd700991918020009bab30220013012003301c375400400246644660100040020020066644660100040020060046002002444a666032004266e9520024bd70099191919299980c19b8f00500113374a90001980f1ba80024bd7009998038038018029bae301a003375a6034004603a00660360046002002444a66602e004266e9520024bd70099191919299980b19b8f00500113374a90001980e1ba60024bd7009998038038018029bae3018003375660300046036006603200466e95200033014330053006001480012f5c064646464640026030002601064a66602266e1d20003014375400220022a660269212a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e00163300537586600e60106600e6010006900024000466ebccc020c02400520000023016001300632533300f3370e900118091baa001100115330114912a4578706563746564206f6e20696e636f727265637420636f6e7374727563746f722076617269616e742e001633005300600148008018cc00cc01001520003001001222533301200213374a900125eb804c8c94ccc03cc00c0084cdd2a40006602a00497ae013330050050010033016003301400222323330010014800000c888cccc038cdc380200100a919980200219b8000348008c05c0040048c034dd50008a4c2c6002002444a666012004293099802980098058011998018019806001000ab9a5736ae7155ceaab9e5573eae815d0aba201",
                [protocolKey, royaltyToken],
                {
                    "dataType": "list",
                    "items": [{
                        "title": "Optional",
                        "anyOf": [{
                            "title": "Some",
                            "description": "An optional value.",
                            "dataType": "constructor",
                            "index": 0,
                            "fields": [{ "dataType": "bytes" }],
                        }, {
                            "title": "None",
                            "description": "Nothing.",
                            "dataType": "constructor",
                            "index": 1,
                            "fields": [],
                        }],
                    }, {
                        "title": "RoyaltyToken",
                        "anyOf": [{
                            "title": "RoyaltyToken",
                            "dataType": "constructor",
                            "index": 0,
                            "fields": [{
                                "dataType": "bytes",
                                "title": "policyId",
                            }, {
                                "dataType": "bytes",
                                "title": "assetName",
                            }],
                        }],
                    }],
                } as any,
            ),
        };
    },
    {
        datum: {
            "title": "TradeDatum",
            "anyOf": [{
                "title": "Listing",
                "dataType": "constructor",
                "index": 0,
                "fields": [{
                    "anyOf": [{
                        "title": "ListingDetails",
                        "dataType": "constructor",
                        "index": 0,
                        "fields": [
                            {
                                "title": "owner",
                                "description":
                                    "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0019/#shelley-addresses).",
                                "anyOf": [{
                                    "title": "Address",
                                    "dataType": "constructor",
                                    "index": 0,
                                    "fields": [{
                                        "title": "paymentCredential",
                                        "description":
                                            "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                                        "anyOf": [{
                                            "title":
                                                "VerificationKeyCredential",
                                            "dataType": "constructor",
                                            "index": 0,
                                            "fields": [{ "dataType": "bytes" }],
                                        }, {
                                            "title": "ScriptCredential",
                                            "dataType": "constructor",
                                            "index": 1,
                                            "fields": [{ "dataType": "bytes" }],
                                        }],
                                    }, {
                                        "title": "stakeCredential",
                                        "anyOf": [{
                                            "title": "Some",
                                            "description": "An optional value.",
                                            "dataType": "constructor",
                                            "index": 0,
                                            "fields": [{
                                                "description":
                                                    "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
                                                "anyOf": [{
                                                    "title": "Inline",
                                                    "dataType": "constructor",
                                                    "index": 0,
                                                    "fields": [{
                                                        "description":
                                                            "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                                                        "anyOf": [{
                                                            "title":
                                                                "VerificationKeyCredential",
                                                            "dataType":
                                                                "constructor",
                                                            "index": 0,
                                                            "fields": [{
                                                                "dataType":
                                                                    "bytes",
                                                            }],
                                                        }, {
                                                            "title":
                                                                "ScriptCredential",
                                                            "dataType":
                                                                "constructor",
                                                            "index": 1,
                                                            "fields": [{
                                                                "dataType":
                                                                    "bytes",
                                                            }],
                                                        }],
                                                    }],
                                                }, {
                                                    "title": "Pointer",
                                                    "dataType": "constructor",
                                                    "index": 1,
                                                    "fields": [{
                                                        "dataType": "integer",
                                                        "title": "slotNumber",
                                                    }, {
                                                        "dataType": "integer",
                                                        "title":
                                                            "transactionIndex",
                                                    }, {
                                                        "dataType": "integer",
                                                        "title":
                                                            "certificateIndex",
                                                    }],
                                                }],
                                            }],
                                        }, {
                                            "title": "None",
                                            "description": "Nothing.",
                                            "dataType": "constructor",
                                            "index": 1,
                                            "fields": [],
                                        }],
                                    }],
                                }],
                            },
                            {
                                "dataType": "integer",
                                "title": "requestedLovelace",
                            },
                            {
                                "title": "privateListing",
                                "anyOf": [{
                                    "title": "Some",
                                    "description": "An optional value.",
                                    "dataType": "constructor",
                                    "index": 0,
                                    "fields": [{
                                        "description":
                                            "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0019/#shelley-addresses).",
                                        "anyOf": [{
                                            "title": "Address",
                                            "dataType": "constructor",
                                            "index": 0,
                                            "fields": [{
                                                "title": "paymentCredential",
                                                "description":
                                                    "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                                                "anyOf": [{
                                                    "title":
                                                        "VerificationKeyCredential",
                                                    "dataType": "constructor",
                                                    "index": 0,
                                                    "fields": [{
                                                        "dataType": "bytes",
                                                    }],
                                                }, {
                                                    "title": "ScriptCredential",
                                                    "dataType": "constructor",
                                                    "index": 1,
                                                    "fields": [{
                                                        "dataType": "bytes",
                                                    }],
                                                }],
                                            }, {
                                                "title": "stakeCredential",
                                                "anyOf": [{
                                                    "title": "Some",
                                                    "description":
                                                        "An optional value.",
                                                    "dataType": "constructor",
                                                    "index": 0,
                                                    "fields": [{
                                                        "description":
                                                            "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
                                                        "anyOf": [{
                                                            "title": "Inline",
                                                            "dataType":
                                                                "constructor",
                                                            "index": 0,
                                                            "fields": [{
                                                                "description":
                                                                    "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                                                                "anyOf": [{
                                                                    "title":
                                                                        "VerificationKeyCredential",
                                                                    "dataType":
                                                                        "constructor",
                                                                    "index": 0,
                                                                    "fields": [{
                                                                        "dataType":
                                                                            "bytes",
                                                                    }],
                                                                }, {
                                                                    "title":
                                                                        "ScriptCredential",
                                                                    "dataType":
                                                                        "constructor",
                                                                    "index": 1,
                                                                    "fields": [{
                                                                        "dataType":
                                                                            "bytes",
                                                                    }],
                                                                }],
                                                            }],
                                                        }, {
                                                            "title": "Pointer",
                                                            "dataType":
                                                                "constructor",
                                                            "index": 1,
                                                            "fields": [{
                                                                "dataType":
                                                                    "integer",
                                                                "title":
                                                                    "slotNumber",
                                                            }, {
                                                                "dataType":
                                                                    "integer",
                                                                "title":
                                                                    "transactionIndex",
                                                            }, {
                                                                "dataType":
                                                                    "integer",
                                                                "title":
                                                                    "certificateIndex",
                                                            }],
                                                        }],
                                                    }],
                                                }, {
                                                    "title": "None",
                                                    "description": "Nothing.",
                                                    "dataType": "constructor",
                                                    "index": 1,
                                                    "fields": [],
                                                }],
                                            }],
                                        }],
                                    }],
                                }, {
                                    "title": "None",
                                    "description": "Nothing.",
                                    "dataType": "constructor",
                                    "index": 1,
                                    "fields": [],
                                }],
                            },
                        ],
                    }],
                }],
            }, {
                "title": "Bid",
                "dataType": "constructor",
                "index": 1,
                "fields": [{
                    "anyOf": [{
                        "title": "BiddingDetails",
                        "dataType": "constructor",
                        "index": 0,
                        "fields": [{
                            "title": "owner",
                            "description":
                                "A Cardano `Address` typically holding one or two credential references.\n\n Note that legacy bootstrap addresses (a.k.a. 'Byron addresses') are\n completely excluded from Plutus contexts. Thus, from an on-chain\n perspective only exists addresses of type 00, 01, ..., 07 as detailed\n in [CIP-0019 :: Shelley Addresses](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0019/#shelley-addresses).",
                            "anyOf": [{
                                "title": "Address",
                                "dataType": "constructor",
                                "index": 0,
                                "fields": [{
                                    "title": "paymentCredential",
                                    "description":
                                        "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                                    "anyOf": [{
                                        "title": "VerificationKeyCredential",
                                        "dataType": "constructor",
                                        "index": 0,
                                        "fields": [{ "dataType": "bytes" }],
                                    }, {
                                        "title": "ScriptCredential",
                                        "dataType": "constructor",
                                        "index": 1,
                                        "fields": [{ "dataType": "bytes" }],
                                    }],
                                }, {
                                    "title": "stakeCredential",
                                    "anyOf": [{
                                        "title": "Some",
                                        "description": "An optional value.",
                                        "dataType": "constructor",
                                        "index": 0,
                                        "fields": [{
                                            "description":
                                                "Represent a type of object that can be represented either inline (by hash)\n or via a reference (i.e. a pointer to an on-chain location).\n\n This is mainly use for capturing pointers to a stake credential\n registration certificate in the case of so-called pointer addresses.",
                                            "anyOf": [{
                                                "title": "Inline",
                                                "dataType": "constructor",
                                                "index": 0,
                                                "fields": [{
                                                    "description":
                                                        "A general structure for representing an on-chain `Credential`.\n\n Credentials are always one of two kinds: a direct public/private key\n pair, or a script (native or Plutus).",
                                                    "anyOf": [{
                                                        "title":
                                                            "VerificationKeyCredential",
                                                        "dataType":
                                                            "constructor",
                                                        "index": 0,
                                                        "fields": [{
                                                            "dataType": "bytes",
                                                        }],
                                                    }, {
                                                        "title":
                                                            "ScriptCredential",
                                                        "dataType":
                                                            "constructor",
                                                        "index": 1,
                                                        "fields": [{
                                                            "dataType": "bytes",
                                                        }],
                                                    }],
                                                }],
                                            }, {
                                                "title": "Pointer",
                                                "dataType": "constructor",
                                                "index": 1,
                                                "fields": [{
                                                    "dataType": "integer",
                                                    "title": "slotNumber",
                                                }, {
                                                    "dataType": "integer",
                                                    "title": "transactionIndex",
                                                }, {
                                                    "dataType": "integer",
                                                    "title": "certificateIndex",
                                                }],
                                            }],
                                        }],
                                    }, {
                                        "title": "None",
                                        "description": "Nothing.",
                                        "dataType": "constructor",
                                        "index": 1,
                                        "fields": [],
                                    }],
                                }],
                            }],
                        }, {
                            "title": "requestedOption",
                            "anyOf": [{
                                "title": "SpecificValue",
                                "dataType": "constructor",
                                "index": 0,
                                "fields": [{
                                    "description":
                                        "A multi-asset output `Value`. Contains tokens indexed by [PolicyId](#PolicyId) and [AssetName](#AssetName).\n\n This type maintain some invariants by construction; in particular, a `Value` will never contain a\n zero quantity of a particular token.",
                                    "dataType": "map",
                                    "keys": { "dataType": "bytes" },
                                    "values": {
                                        "title": "Dict",
                                        "description":
                                            "An opaque `Dict`. The type is opaque because the module maintains some\n invariant, namely: there's only one occurence of a given key in the dictionnary.\n\n Note that the `key` parameter is a phantom-type, and only present as a\n means of documentation. Keys are always `ByteArray`, but can be given\n meaningful names.\n\n See for example:\n\n ```aiken\n pub type Value =\n   Dict<PolicyId, Dict<AssetName, Int>>\n ```",
                                        "dataType": "map",
                                        "keys": { "dataType": "bytes" },
                                        "values": { "dataType": "integer" },
                                    },
                                }],
                            }, {
                                "title": "SpecificPolicyIdWithConstraints",
                                "dataType": "constructor",
                                "index": 1,
                                "fields": [{ "dataType": "bytes" }, {
                                    "dataType": "list",
                                    "items": { "dataType": "bytes" },
                                }, {
                                    "anyOf": [{
                                        "title": "Some",
                                        "description": "An optional value.",
                                        "dataType": "constructor",
                                        "index": 0,
                                        "fields": [{
                                            "dataType": "list",
                                            "items": {
                                                "title": "TraitOption",
                                                "anyOf": [{
                                                    "title": "Included",
                                                    "dataType": "constructor",
                                                    "index": 0,
                                                    "fields": [{
                                                        "dataType": "bytes",
                                                    }],
                                                }, {
                                                    "title": "Excluded",
                                                    "dataType": "constructor",
                                                    "index": 1,
                                                    "fields": [{
                                                        "dataType": "bytes",
                                                    }],
                                                }],
                                            },
                                        }],
                                    }, {
                                        "title": "None",
                                        "description": "Nothing.",
                                        "dataType": "constructor",
                                        "index": 1,
                                        "fields": [],
                                    }],
                                }],
                            }],
                        }],
                    }],
                }],
            }],
        },
    },
    {
        action: {
            "title": "TradeAction",
            "anyOf": [{
                "title": "Sell",
                "dataType": "constructor",
                "index": 0,
                "fields": [],
            }, {
                "title": "Buy",
                "dataType": "constructor",
                "index": 1,
                "fields": [],
            }, {
                "title": "Cancel",
                "dataType": "constructor",
                "index": 2,
                "fields": [],
            }],
        },
    },
) as unknown as NebulaSpend;

export interface OneshotMint {
    new (
        outputReference: {
            transactionId: { hash: string };
            outputIndex: bigint;
        },
    ): Validator;
    _redeemer: undefined;
}

export const OneshotMint = Object.assign(
    function (
        outputReference: {
            transactionId: { hash: string };
            outputIndex: bigint;
        },
    ) {
        return {
            type: "PlutusV2",
            script: applyParamsToScript(
                "58e301000032323232323232323232222533300632323232533300a3370e0029000099251300400214a060166ea8004c8c8cc004dd6198019802198019802002a40009000119baf33004300500148000020c0040048894ccc03c0084cdd2a400497ae013232533300d300300213374a90001980900125eb804ccc01401400400cc04c00cc04400888c8ccc0040052000003222333300c3370e008004024466600800866e0000d200230140010012300a37540022930b180080091129998040010a4c26600a600260140046660060066016004002ae695cdaab9d5573caae7d5d02ba157441",
                [outputReference],
                {
                    "dataType": "list",
                    "items": [{
                        "title": "OutputReference",
                        "description":
                            "An `OutputReference` is a unique reference to an output on-chain. The `output_index`\n corresponds to the position in the output list of the transaction (identified by its id)\n that produced that output",
                        "anyOf": [{
                            "title": "OutputReference",
                            "dataType": "constructor",
                            "index": 0,
                            "fields": [{
                                "title": "transactionId",
                                "description":
                                    "A unique transaction identifier, as the hash of a transaction body. Note that the transaction id\n isn't a direct hash of the `Transaction` as visible on-chain. Rather, they correspond to hash\n digests of transaction body as they are serialized on the network.",
                                "anyOf": [{
                                    "title": "TransactionId",
                                    "dataType": "constructor",
                                    "index": 0,
                                    "fields": [{
                                        "dataType": "bytes",
                                        "title": "hash",
                                    }],
                                }],
                            }, {
                                "dataType": "integer",
                                "title": "outputIndex",
                            }],
                        }],
                    }],
                } as any,
            ),
        };
    },
    {
        _redeemer: {
            "title": "Unit",
            "description": "The nullary constructor.",
            "anyOf": [{ "dataType": "constructor", "index": 0, "fields": [] }],
        },
    },
) as unknown as OneshotMint;
