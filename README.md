<p align="center">
  <a href="https://spacebudz.io">
    <img alt="Gatsby" src="./src/images/assets/spacebudz.png" width="60" />
  </a>
</p>
<h1 align="center">
  SpaceBudz
</h1>

SpaceBudz is an NFT collection on Cardano consisting of 10,000 unique little astronauts. We make use of Cardano's multi asset ledger for the NFTs and Plutus validators for the market place.
This repository contains the full market place implementation including the frontend interface.
Our official website: [spacebudz.io](https://spacebudz.io)

### Validity

To make sure you have a real SpaceBud the Policy ID must match the following:
**`d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc`**

You can find the according policy script in `minting_policy.json`

The contract address for the official SpaceBudz market place:
**`addr_test1qzfauplclmk6fxuncn8adqt7hnahhlz2pvvzxlqpj6eqtk35g6en4e2aya53ewldpqxl2xpzvtps0ndtvtf6fzpl880srm02gc`**

### Metadata

We follow [CIP-25](https://github.com/cardano-foundation/CIPs/blob/master/CIP-0025/CIP-0025.md), the NFT metadata standard on Cardano, which was created by SpaceBudz.

Images are stored on IPFS and Arweave and you find the image link to a SpaceBud inside the metadata.

### Market place

We have a seperated module inside this repository for the market place with the full source.
Check it out [here](./src/cardano/market/).
