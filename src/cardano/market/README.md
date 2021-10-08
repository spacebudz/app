<p align="center">
  <a href="https://spacebudz.io">
    <img alt="Gatsby" src="../../images/assets/spacebudz.png" width="60" />
  </a>
</p>
<h1 align="center">
  SpaceBudz-Market
</h1>

This module contains the full logic of the SpaceBudz market place.
The `contract.hs` file contains the validator and the off-chain code written in Haskell. For the actual market place on the website the off-chain code was rewritten in JavaScript (`./index.js`) in combination with a customized version of the [serialization-lib](https://github.com/Emurgo/cardano-serialization-lib). This customized version you can find under `./custom_modules` (for browser and NodeJs).

The SpaceBudz market place can be run by community members. **0.4%** of the traded amount goes to a community member, if trades happens through his market instance.

The contract address:
**`addr_test1qr0yva2r7l8wjyfcpptewfu6gk88gqsvxzlqkvjuatdpr5s6qsq5jaanynnf5848nqwan9g5qru5mn86xpyh4utp3s9srg9vz7`**

### 🚀 Quick start

#### Install

```
git clone https://github.com/Berry-Pool/spacebudz
cp spacebudz/src/cardano/market .
npm install
```

#### Run

```js
import Market from "./index.js";

const market = new Market(
  {
    base: "https://cardano-testnet.blockfrost.io/api/v0",
    projectId: "<BLOCKFROST_ID>",
  },
  "<YOUR ADDRESS>"
);

const init = async () => {
  await market.load();

  // make bid on SpaceBud #0
  const bidUtxo = await market.getBid(0);
  const txHash = await market.bid(bidUtxo, "80000000"); // 80 ADA
};
init();
```

**Note**
With the default setup it is expected that the market place is run the browser and in combination with [Nami Wallet](https://namiwallet.io), because it is tightly integrated into the market place. Also we recommend to use Webpack 5 and set `syncWebAssambly` to `true` (or `asyncWebAssambly` in case the latter doesn't work for you) in the `webpack.config.js` file.

With some little tweaks this module can also run in NodeJs. Import the serialization-lib for NodeJs, replace all `window.cardano` functions with the needed value there and import `node-fetch`.

#### API

All functions are asynchronous.

```js
- getBid(budId : number) : TradeUtxo
// If you want to check if a bid is currently active or it is the start bid:
if (Buffer.from(bidUtxo.datum.to_bytes()).toString("hex")) !== "d866820080")
// if true then it's a start bid otherwise an active bid

- getOffer(budId : number) : TradeUtxo | TradeUtxo[] | undefined
// getOffer returns undefined if the SpaceBud is not listed
// it can return an array of two offerUtxos because of the twins (1903, 6413)

- bid(bidUtxo : TradeUtxo, bidAmount) : Transaction Id // bidAmount in lovelace

- offer(budId: number, requestedAmount : string) : Transaction Id // requestedAmount in lovelace

- buy(offerUtxo : TradeUtxo) : Transaction Id

- sell(bidUtxo : TradeUtxo) : Transaction Id

- cancelBid(bidUtxo : TradeUtxo) : Transaction Id

- cancelOffer(offerUtxo : TradeUtxo) : Transaction Id
```

### State machine

The states a script UTxO can go into, where the datum is the actual state and the transitions the redeemers. `StartBid` and `Offer` are valid initial states a UTxO can hold:

<p align="center">
    <img alt="Gatsby" src="./assets/state_machine.svg" width="100%" />
</p>
