<p align="center">
  <a href="https://spacebudz.io">
    <img alt="Gatsby" src="../../images/assets/spacebudz.png" width="60" />
  </a>
</p>
<h1 align="center">
  SpaceBudz-Market
</h1>

This module contains the full logic of the SpaceBudz market place.
The `contract.hs` file contains the validator and the off-chain code written in Haskell. For the actual market place on the website the off-chain code was rewritten in JavaScript in combination with a customized version of the [serialization-lib](https://github.com/Emurgo/cardano-serialization-lib). This customized version you can find under `./custom_modules` (for browser and NodeJs).

### 🚀 Quick start

### State machine

The states a script UTxO can go into, where the datum is the actual state and the transition the redeemer. `StartBid` and `Offer` are valid initial states a UTxO can hold:

<p align="center">
  <a href="https://spacebudz.io">
    <img alt="Gatsby" src="./assets/state_machine.svg" />
  </a>
</p>
