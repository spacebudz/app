import {
  addWitnessToMultisigSession,
  createMultisigSession,
  getProtocolParameters,
  getUTxOs,
} from "../../api";
import CoinSelection from "../../cardano/market/coinSelection";
import {
  TransactionOutputs,
  NativeScript,
} from "../../cardano/market/custom_modules/@emurgo/cardano-serialization-lib-browser/cardano_serialization_lib";
import { getSelectedWallet, toHex, utxoToCSLFormat } from "../../utils";
const S = await import(
  "../../cardano/market/custom_modules/@emurgo/cardano-serialization-lib-browser"
);
import Loader from "../../cardano/market/loader";

type MultiSig = {
  script: NativeScript;
  address: string;
};

const coSigners = [
  "d52e11f3e48436dd42dbec6d88c239732e503b8b7a32af58e5f87625",
  "2b460b47836d9dd1bda529872e493a657a08486a6c93f424f90f0cbe",
  "1a2512fe8ca23d60a04276888ca3c1754e9a47ab26ef050459887e1f",
  "a0ae344dc1d71200347bd6304195b1807961f206505f51ff9a83cdf3",
  "1447eed2459229d971a4681351e0936f4b7e5b48da9cc5c8384850b8",
  "a4e16597fe0242865c7b86bc2c597b8b09a69ceaedea6193779b168d",
];

export const createMultisig = (): MultiSig => {
  const coSignersScripts = S.NativeScripts.new();
  coSigners.forEach((coSigner) => {
    coSignersScripts.add(
      S.NativeScript.new_script_pubkey(
        S.ScriptPubkey.new(
          S.Ed25519KeyHash.from_bytes(Buffer.from(coSigner, "hex"))
        )
      )
    );
  });

  const multisig = S.NativeScript.new_script_n_of_k(
    S.ScriptNOfK.new(3, coSignersScripts)
  );

  const address = S.BaseAddress.new(
    S.NetworkInfo.mainnet().network_id(),
    S.StakeCredential.from_scripthash(
      multisig.hash(S.ScriptHashNamespace.NativeScript)
    ),
    S.StakeCredential.from_scripthash(
      multisig.hash(S.ScriptHashNamespace.NativeScript)
    )
  )
    .to_address()
    .to_bech32();

  return {
    script: multisig,
    address,
  };
};

export type Recipient = { address: string; amount: BigInt };

export const createTransaction = async (
  recipients: Recipient[],
  message: string
): Promise<string> => {
  await Loader.load();
  const protocolParameters = await getProtocolParameters();
  const multisig = createMultisig();

  const txBuilderConfig = S.TransactionBuilderConfigBuilder.new()
    .coins_per_utxo_word(
      S.BigNum.from_str(protocolParameters.coinsPerUtxoWord.toString())
    )
    .fee_algo(
      S.LinearFee.new(
        S.BigNum.from_str(protocolParameters.minFeeA.toString()),
        S.BigNum.from_str(protocolParameters.minFeeB.toString())
      )
    )
    .key_deposit(S.BigNum.from_str(protocolParameters.keyDeposit.toString()))
    .pool_deposit(S.BigNum.from_str(protocolParameters.poolDeposit.toString()))
    .max_tx_size(protocolParameters.maxTxSize)
    .max_value_size(protocolParameters.maxValSize)
    .price_mem(protocolParameters.priceMem)
    .price_step(protocolParameters.priceStep)
    .prefer_pure_change(true)
    .build();
  const txBuilder = S.TransactionBuilder.new(txBuilderConfig);

  const utxos = (await getUTxOs(multisig.address)).map((utxo) =>
    utxoToCSLFormat(utxo)
  );

  const outputs: TransactionOutputs = S.TransactionOutputs.new();
  recipients.forEach((recipient) => {
    outputs.add(
      S.TransactionOutput.new(
        S.Address.from_bech32(recipient.address),
        S.Value.new(S.BigNum.from_str(recipient.amount.toString()))
      )
    );
  });

  CoinSelection.setProtocolParameters(
    protocolParameters.coinsPerUtxoWord.toString(),
    protocolParameters.minFeeA.toString(),
    protocolParameters.minFeeB.toString(),
    protocolParameters.maxTxSize.toString()
  );
  const { input: inputs } = CoinSelection.randomImprove(utxos, outputs, 50);

  inputs.forEach((input) => {
    txBuilder.add_input(
      input.output().address(),
      input.input(),
      input.output().amount()
    );
  });
  for (let i = 0; i < outputs.len(); i++) {
    txBuilder.add_output(outputs.get(i));
  }

  txBuilder.set_ttl(protocolParameters.slot + 21600);
  const auxData = S.AuxiliaryData.new();
  const metadata = S.GeneralTransactionMetadata.new();
  metadata.insert(
    S.BigNum.from_str("674"),
    S.encode_json_str_to_metadatum(
      JSON.stringify({ msg: chunkSubstr(message, 64) }),
      S.MetadataJsonSchema.BasicConversions
    )
  );
  auxData.set_metadata(metadata);
  txBuilder.set_auxiliary_data(auxData);

  // // populate fake witnesses for multisig (at least 3 signatures necessary => add 3 extra witnesses)
  [
    "addr1q80f9lhqmz96w523y5tjuxe6kxx7c6439ne8tmsth9ecv8c6kuka7j952zs29d40lxved9f7yz6jnsuxnpp05pms2uesl5ym97",
    "addr1qy7uczyqryp970t90s9dafcyk876923c2kprpe8m3de626q6kuka7j952zs29d40lxved9f7yz6jnsuxnpp05pms2uesx4akkn",
    "addr1qx75k7gjynax6djrq52jx7nsfs8c9g3cdnwfswzrkap3c3c6kuka7j952zs29d40lxved9f7yz6jnsuxnpp05pms2uesnyu0mj",
  ].forEach((addr) =>
    txBuilder.add_address_witness(S.Address.from_bech32(addr))
  );

  const nativeScripts = S.NativeScripts.new();
  nativeScripts.add(multisig.script);

  txBuilder.set_native_scripts(nativeScripts);

  txBuilder.add_change_if_needed(S.Address.from_bech32(multisig.address));

  const txWitnessSet = S.TransactionWitnessSet.new();

  txWitnessSet.set_native_scripts(nativeScripts);

  const tx = S.Transaction.new(txBuilder.build(), txWitnessSet, auxData);

  const txHex = toHex(tx.to_bytes());
  const session = await createMultisigSession(txHex);

  return session;
};

type Action = "Signed" | { Submitted: string } | undefined;

export const signTransaction = async (
  session: string,
  tx: string,
  witnesses: string[]
): Promise<Action> => {
  const selectedWallet = await getSelectedWallet();

  const parsedWitnesses = witnesses.map((w) =>
    S.TransactionWitnessSet.from_bytes(Buffer.from(w, "hex"))
  );

  const witness = await selectedWallet.signTx(tx, true).catch((e) => {
    throw new Error("Transaction signature refused");
  });

  const parsedWitness = S.TransactionWitnessSet.from_bytes(
    Buffer.from(witness, "hex")
  );

  if (parsedWitness.vkeys().len() <= 0)
    throw new Error("Transaction could not be signed");

  if (
    parsedWitnesses.some(
      (w) =>
        Buffer.from(
          w.vkeys().get(0).vkey().public_key().hash().to_bytes()
        ).toString("hex") ===
        Buffer.from(
          parsedWitness.vkeys().get(0).vkey().public_key().hash().to_bytes()
        ).toString("hex")
    )
  )
    throw new Error("Transaction already signed");

  if (
    !coSigners.some(
      (cosigner) =>
        cosigner ===
        Buffer.from(
          parsedWitness.vkeys().get(0).vkey().public_key().hash().to_bytes()
        ).toString("hex")
    )
  )
    throw new Error("Transaction signed by invalid co-signer");

  await addWitnessToMultisigSession(session, witness);

  if (witnesses.length < 2) return "Signed";

  const parsedTx = S.Transaction.from_bytes(Buffer.from(tx, "hex"));
  const mergedTxWitnesses = S.TransactionWitnessSet.new();
  const mergedVkeyWitnesses = S.Vkeywitnesses.new();
  mergedVkeyWitnesses.add(parsedWitness.vkeys().get(0));

  parsedWitnesses.forEach((w) => {
    mergedVkeyWitnesses.add(w.vkeys().get(0));
  });
  mergedTxWitnesses.set_vkeys(mergedVkeyWitnesses);
  mergedTxWitnesses.set_native_scripts(parsedTx.witness_set().native_scripts());

  const signedTx = S.Transaction.new(
    parsedTx.body(),
    mergedTxWitnesses,
    parsedTx.auxiliary_data()
  );

  const txHash = await selectedWallet
    .submitTx(toHex(signedTx.to_bytes()))
    .catch((e) => console.error(e));

  if (txHash) return { Submitted: txHash };
};

const chunkSubstr = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};
