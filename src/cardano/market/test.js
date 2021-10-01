import SpaceBudzMarket from "./index.js";
import Loader from "./loader.js";
import { assetsToValue, fromHex, toHex } from "./utils.js";

const provider = {
  projectId: "rbkrp5hOr3khPAWNo3x47t6CP7qKFyA5",
  base: "https://cardano-testnet.blockfrost.io/api/v0",
};

const blockfrostRequest = async (endpoint, headers, body) => {
  return await fetch(provider.base + endpoint, {
    headers: {
      project_id: provider.projectId,
      ...headers,
      "User-Agent": "spacebudz-marketplace",
    },
    method: body ? "POST" : "GET",
    body,
  }).then((res) => res.json());
};

export const utxoFromJson = (output, address) => {
  return Loader.Cardano.TransactionUnspentOutput.new(
    Loader.Cardano.TransactionInput.new(
      Loader.Cardano.TransactionHash.from_bytes(
        Buffer.from(output.tx_hash || output.txHash, "hex")
      ),
      output.output_index || output.txId
    ),
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bytes(Buffer.from(address, "hex")),
      assetsToValue(output.amount)
    )
  );
};

const getUtxos = async (address) => {
  let result = [];
  let page = 1;
  while (true) {
    let pageResult = await blockfrostRequest(
      `/addresses/${address.to_address().to_bech32()}/utxos?page=${page}`
    );
    if (pageResult.error) {
      pageResult = [];
    }
    result = result.concat(pageResult);
    if (pageResult.length <= 0) break;
    page++;
  }

  const converted = result.map((utxo) =>
    toHex(utxoFromJson(utxo, toHex(address.to_address().to_bytes())).to_bytes())
  );

  return converted;
};

const wallet = () => {
  const harden = (num) => {
    return 0x80000000 + num;
  };
  const root = Loader.Cardano.Bip32PrivateKey.from_bech32(
    // "xprv1wpfyt0xd64nstz3ae34hutdf6drhk6xfmmur9vsax4qachvcpd9lqkdguve8d8a5fcjh2vxauums8jkj2c64m7vksla5as9dp8smgf0s2wrvpa875655qsa8gqtfv7qwmwj3nkvct5eufq5qz0cdez3qggkhwf4k" //addr_test1vqk87dgz03rg36clgpxwpynpm059lnwv3lcdmqydcuhsxaqmqynxd
    "xprv1xqpnwlktxep7cur77u2lgk5cvq43nwq2fjn6hk5ejhcpcqw9zpdj7qtnp5nwuewtl494wpx5la020zt59te6ul6efz9h9j9kyhntqv95mgxd2uka6zsw5nxzqj3evhu7wplw8jlhxmwjj00wzrwga4dk0ysvnek8"
  );
  const account = root
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type;
    .derive(harden(0));
  const sk = account.derive(0).derive(0).to_raw_key();
  const pk = sk.to_public();
  const address = Loader.Cardano.EnterpriseAddress.new(
    Loader.Cardano.NetworkInfo.testnet().network_id(),
    Loader.Cardano.StakeCredential.from_keyhash(pk.hash())
  );
  return { sk, pk, address };
};

const testBid = async () => {
  const m = new SpaceBudzMarket(
    {
      base: "https://cardano-testnet.blockfrost.io/api/v0",
      projectId: "rbkrp5hOr3khPAWNo3x47t6CP7qKFyA5",
    },
    "addr_test1qr9zsfqywwyq5yux0lrzspl4xnfvylkl3lefg9x5qkv4spzugzp2zkl25me7rwq8rhcjwna2460fct404h5vte63a3gs5eu3xf"
  );
  await m.load();
  const { sk, pk, address } = wallet();
  const window = { cardano: {} };
  //Mock
  window.cardano.getUsedAddresses = () => [
    toHex(address.to_address().to_bytes()),
  ];
  let collateral = Loader.Cardano.TransactionUnspentOutput.new(
    Loader.Cardano.TransactionInput.new(
      Loader.Cardano.TransactionHash.from_bytes(
        fromHex(
          "bd395b4f43d01c55619c24866302614bd7ff2f153d320d83856d2e7d12a0116a"
        )
      ),
      2
    ),
    Loader.Cardano.TransactionOutput.new(
      Loader.Cardano.Address.from_bech32(
        "addr_test1vzf0h8m083u70rtkmtunvzyeeanurcjya8ywzc98ntlm0gsm0cd70"
      ),
      Loader.Cardano.Value.new(Loader.Cardano.BigNum.from_str("4914799"))
    )
  );

  collateral = toHex(collateral.to_bytes());
  const utxos = await getUtxos(address);
  window.cardano.getUtxos = () => utxos.filter((utxo) => utxo != collateral);
  window.cardano.getCollateralInputs = () => [collateral];
  globalThis.window = window;

  const tx = await m.cancelBid("5");

  console.log(tx.body().fee().to_str());
  const vkeys = Loader.Cardano.Vkeywitnesses.new();
  vkeys.add(
    Loader.Cardano.make_vkey_witness(
      Loader.Cardano.hash_transaction(tx.body()),
      sk
    )
  );
  const witnessSet = tx.witness_set();
  witnessSet.set_vkeys(vkeys);
  const signedTx = Loader.Cardano.Transaction.new(
    tx.body(),
    witnessSet,
    tx.auxiliary_data()
  );
  // console.log(toHex(signedTx.to_bytes()));
  const result = await blockfrostRequest(
    `/tx/submit`,
    { "Content-Type": "application/cbor" },
    Buffer.from(signedTx.to_bytes())
  );
  console.log(result);
};

testBid();

const testBigNum = async () => {
  await Loader.load();
  const num1 = Loader.Cardano.BigNum.from_str("10").checked_mul(
    Loader.Cardano.BigNum.from_str("10")
  );
  const num2 = Loader.Cardano.BigNum.from_str("4");
  const num3 = Loader.Cardano.BigNum.from_str("3");
  const res = num1.checked_sub(num2).checked_sub(num3);
  // const res = lovelacePercentage(num1, num2);
  console.log(res.to_str());
};
// testBigNum();

const initBidToken = async () => {
  await Loader.load();
  const { sk, pk, address } = wallet();

  const protocolParameters = {
    linearFee: {
      minFeeA: "44",
      minFeeB: "155381",
    },
    minUtxo: "1000000",
    poolDeposit: "500000000",
    keyDeposit: "2000000",
    maxValSize: "5000",
    maxTxSize: 16384,
    priceMem: 5.77e-2,
    priceStep: 7.21e-5,
  };
  const START_BID = () => {
    const datum = Loader.Cardano.PlutusData.new_constr_plutus_data(
      Loader.Cardano.ConstrPlutusData.new(
        Loader.Cardano.Int.new_i32(0),
        Loader.Cardano.PlutusList.new()
      )
    );
    return datum;
  };

  const txBuilder = Loader.Cardano.TransactionBuilder.new(
    Loader.Cardano.LinearFee.new(
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeA),
      Loader.Cardano.BigNum.from_str(protocolParameters.linearFee.minFeeB)
    ),
    Loader.Cardano.BigNum.from_str(protocolParameters.minUtxo),
    Loader.Cardano.BigNum.from_str(protocolParameters.poolDeposit),
    Loader.Cardano.BigNum.from_str(protocolParameters.keyDeposit),
    protocolParameters.maxValSize,
    protocolParameters.maxTxSize,
    protocolParameters.priceMem,
    protocolParameters.priceStep
  );
  txBuilder.add_input(
    Loader.Cardano.Address.from_bech32(
      "addr_test1vzf0h8m083u70rtkmtunvzyeeanurcjya8ywzc98ntlm0gsm0cd70"
    ),
    Loader.Cardano.TransactionInput.new(
      Loader.Cardano.TransactionHash.from_bytes(
        fromHex(
          "a77a5255b6b9a42b267773b0b98d203c5b9c24074d998a811e513b5b8f062d6e"
        )
      ),
      0
    ),
    assetsToValue([
      { unit: "lovelace", quantity: "5000000" },
      {
        unit: "11e6cd0f89920242317a6cba919d7637008d119ff46a8c29de6f014a537061636542756442696431",
        quantity: "1",
      },
      {
        unit: "11e6cd0f89920242317a6cba919d7637008d119ff46a8c29de6f014a537061636542756442696432",
        quantity: "1",
      },
    ])
  );
  const output = Loader.Cardano.TransactionOutput.new(
    Loader.Cardano.Address.from_bech32(
      "addr_test1wrl7xctcf777vcrw0hshgheqfam4qpe7s8ngl2ergvu9a6s4ydpcg"
    ),
    assetsToValue([
      { unit: "lovelace", quantity: "2500000" },
      {
        unit: "11e6cd0f89920242317a6cba919d7637008d119ff46a8c29de6f014a537061636542756442696431",
        quantity: "1",
      },
      {
        unit: "11e6cd0f89920242317a6cba919d7637008d119ff46a8c29de6f014a537061636542756442696432",
        quantity: "1",
      },
    ])
  );
  output.set_data_hash(Loader.Cardano.hash_plutus_data(START_BID()));
  txBuilder.add_output(output);

  const metadata = Loader.Cardano.GeneralTransactionMetadata.new();
  metadata.insert(
    Loader.Cardano.BigNum.from_str("405"),
    Loader.Cardano.encode_json_str_to_metadatum(
      JSON.stringify({
        0: "0x" + toHex(START_BID().to_bytes()),
      }),
      1
    )
  );
  const aux_data = Loader.Cardano.AuxiliaryData.new();
  aux_data.set_metadata(metadata);
  txBuilder.set_auxiliary_data(aux_data);
  txBuilder.add_change_if_needed(
    Loader.Cardano.Address.from_bech32(
      "addr_test1vzf0h8m083u70rtkmtunvzyeeanurcjya8ywzc98ntlm0gsm0cd70"
    )
  );
  const txBody = txBuilder.build();
  const txWitnesses = Loader.Cardano.TransactionWitnessSet.new();
  const vkeys = Loader.Cardano.Vkeywitnesses.new();
  vkeys.add(
    Loader.Cardano.make_vkey_witness(
      Loader.Cardano.hash_transaction(txBody),
      sk
    )
  );
  txWitnesses.set_vkeys(vkeys);
  const tx = Loader.Cardano.Transaction.new(txBody, txWitnesses, aux_data);
  // console.log(toHex(tx.to_bytes()));
  const result = await blockfrostRequest(
    `/tx/submit`,
    { "Content-Type": "application/cbor" },
    Buffer.from(tx.to_bytes())
  );
  console.log(result);
  //addr_test1vzf0h8m083u70rtkmtunvzyeeanurcjya8ywzc98ntlm0gsm0cd70
};

// initBidToken();
