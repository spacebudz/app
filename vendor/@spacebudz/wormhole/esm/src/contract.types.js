import { Data } from "../deps.js";
export const MetadataSchema = Data.Map(Data.Bytes(), Data.Any());
export const Metadata = MetadataSchema;
export const DatumMetadataSchema = Data.Object({
    metadata: MetadataSchema,
    version: Data.Integer({ minimum: 1, maximum: 1 }),
    extra: Data.Any(),
});
export const DatumMetadata = DatumMetadataSchema;
export const OutRefSchema = Data.Object({
    txHash: Data.Object({ hash: Data.Bytes({ minLength: 32, maxLength: 32 }) }),
    outputIndex: Data.Integer(),
});
export const OutRef = OutRefSchema;
export const Hash = Data.Object({
    hash: Data.Bytes({ minLength: 32, maxLength: 32 }),
});
export const DetailsParamsSchema = Data.Tuple([
    Data.Bytes({ minLength: 4, maxLength: 4 }),
    Data.Object({
        extraOref: OutRefSchema,
        royaltyName: Data.Bytes(),
        ipName: Data.Bytes(),
        oldPolicyId: Data.Bytes({ minLength: 28, maxLength: 28 }),
        merkleRoot: Hash,
        refAddress: Data.Bytes({ minLength: 28, maxLength: 28 }),
        lockAddress: Data.Bytes({ minLength: 28, maxLength: 28 }),
        nonce: Data.Integer(),
    }),
]);
export const DetailsParams = DetailsParamsSchema;
export const RefParamsSchema = Data.Tuple([
    Data.Bytes({ minLength: 4, maxLength: 4 }),
    Data.Bytes({ minLength: 4, maxLength: 4 }),
    Data.Bytes({ minLength: 4, maxLength: 4 }), // label 222
]);
export const RefParams = RefParamsSchema;
export const LockParamsSchema = Data.Tuple([
    Data.Bytes({ minLength: 4, maxLength: 4 }),
    Data.Bytes({ minLength: 4, maxLength: 4 }),
    Data.Bytes({ minLength: 4, maxLength: 4 }),
    Data.Bytes({ minLength: 28, maxLength: 28 }),
]);
export const LockParams = LockParamsSchema;
export const ProofSchema = Data.Array(Data.Enum([
    Data.Object({ Left: Data.Tuple([Hash]) }),
    Data.Object({ Right: Data.Tuple([Hash]) }),
]));
export const Proof = ProofSchema;
export const ActionSchema = Data.Enum([
    Data.Object({ Mint: Data.Tuple([Data.Array(ProofSchema)]) }),
    Data.Literal("Burn"),
    Data.Literal("MintExtra"),
]);
export const Action = ActionSchema;
export const RefActionSchema = Data.Enum([
    Data.Literal("Burn"),
    Data.Literal("Move"),
]);
export const RefAction = RefActionSchema;
export const CredentialSchema = Data.Enum([
    Data.Object({
        PublicKeyCredential: Data.Tuple([
            Data.Bytes({ minLength: 28, maxLength: 28 }),
        ]),
    }),
    Data.Object({
        ScriptCredential: Data.Tuple([
            Data.Bytes({ minLength: 28, maxLength: 28 }),
        ]),
    }),
]);
export const Credential = CredentialSchema;
export const AddressSchema = Data.Object({
    paymentCredential: CredentialSchema,
    stakeCredential: Data.Nullable(Data.Enum([
        Data.Object({ Inline: Data.Tuple([CredentialSchema]) }),
        Data.Object({
            Pointer: Data.Tuple([Data.Object({
                    slotNumber: Data.Integer(),
                    transactionIndex: Data.Integer(),
                    certificateIndex: Data.Integer(),
                })]),
        }),
    ])),
});
export const Address = AddressSchema;
export const RoyaltyRecipientSchema = Data.Object({
    address: AddressSchema,
    fee: Data.Integer({ minimum: 1 }),
    minFee: Data.Nullable(Data.Integer()),
    maxFee: Data.Nullable(Data.Integer()),
});
export const RoyaltyRecipient = RoyaltyRecipientSchema;
export const RoyaltyInfoSchema = Data.Object({
    recipients: Data.Array(RoyaltyRecipientSchema),
    version: Data.Integer({ minimum: 1, maximum: 1 }),
    extra: Data.Any(),
});
export const RoyaltyInfo = RoyaltyInfoSchema;
