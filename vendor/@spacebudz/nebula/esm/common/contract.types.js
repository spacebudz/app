import { Data } from "../deps.js";
const PolicyId = Data.Bytes({ minLength: 28, maxLength: 28 });
const CredentialSchema = Data.Enum([
    Data.Object({
        VerificationKeyCredential: Data.Tuple([
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
const AddressSchema = Data.Object({
    paymentCredential: CredentialSchema,
    stakeCredential: Data.Nullable(Data.Enum([
        Data.Object({ Inline: Data.Tuple([CredentialSchema]) }),
        Data.Object({
            Pointer: Data.Object({
                slotNumber: Data.Integer(),
                transactionIndex: Data.Integer(),
                certificateIndex: Data.Integer(),
            }),
        }),
    ])),
});
export const Address = AddressSchema;
export const Value = Data.Map(PolicyId, Data.Map(Data.Bytes(), Data.Integer()));
const OutRefSchema = Data.Object({
    transactionId: Data.Object({
        hash: Data.Bytes({ minLength: 32, maxLength: 32 }),
    }),
    outputIndex: Data.Integer(),
});
export const OutRef = OutRefSchema;
const RoyaltyRecipientSchmema = Data.Object({
    address: AddressSchema,
    fee: Data.Integer({ minimum: 1 }),
    minFee: Data.Nullable(Data.Integer()),
    maxFee: Data.Nullable(Data.Integer()),
});
export const RoyaltyRecipient = RoyaltyRecipientSchmema;
const RoyaltyInfoSchema = Data.Object({
    recipients: Data.Array(RoyaltyRecipientSchmema),
    version: Data.Integer({ minimum: 1, maximum: 1 }),
    extra: Data.Any(),
});
export const RoyaltyInfo = RoyaltyInfoSchema;
const PaymentDatumSchema = Data.Object({
    outRef: OutRefSchema,
});
export const PaymentDatum = PaymentDatumSchema;
