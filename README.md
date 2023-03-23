<p align="center">
  <img width="100px" src="./src/images/brand/logo.png" align="center" />
  <h1 align="center">SpaceBudz</h1>
  <p align="center">SpaceBudz is an NFT collection built on Cardano, featuring 10,000 little astronauts. Leveraging Cardano's multi-asset ledger, each SpaceBudz NFT is uniquely identified and traceable on the blockchain. Moreover, the project utilizes Plutus validators to create a secure and efficient marketplace for buyers and sellers to exchange SpaceBudz NFTs.
Our official website: <a href="https://spacebudz.io">spacebudz.io</a></p>

  <p align="center">
    <img src="https://img.shields.io/github/commit-activity/m/SpaceBudz/spacebudz?style=for-the-badge" />
    <img src="https://img.shields.io/github/license/SpaceBudz/spacebudz?style=for-the-badge" />
    <a href="https://twitter.com/spacebudzNFT">
      <img src="https://img.shields.io/twitter/follow/spacebudzNFT?style=for-the-badge&logo=twitter" />
    </a>
  </p>

</p>

### Validity

To make sure you have a real SpaceBud the policy id must match the following:
**`4523c5e21d409b81c95b45b0aea275b8ea1406e6cafea5583b9f8a5f`**

You can find the contract based policy in the [Wormhole](https://github.com/spacebudz/wormhole) repository.

The contract address for the official SpaceBudz marketplace:
**`addr1w944m8a98j3gk5mm0as7lqep763t5csdlpzvua5a92h7t8g9dc2c9`**

### Metadata

We follow [CIP-0068](https://github.com/cardano-foundation/CIPs/tree/master/CIP-0068), the Datum NFT metadata standard on Cardano, which was co-created by SpaceBudz.

Images are stored on IPFS and you find the image link as well as the SHA-256 hash to the image inside the metadata of the SpaceBud.

### Marketplace

The SpaceBudz marketplace is built on top of the [Nebula protocol](https://github.com/spacebudz/nebula).


### Community tools

[Here](https://spacebudz.io/communityTools) you can find helpful and useful tools created by the community.

You have created something for SpaceBudz and it's not in the list?
Make a PR!

Add your tool to the registry under `./src/data/toolsRegistry.json` with the following format:
```
  {
    name: string,
    description: string (max 70 characters),
    image: string (relative path to image),
    url: string (e.g. https://spacebudz.io)
  }
```
The `image` property contains the relative path to the image: `../image/toolsRegistry/{image}`. Place the actual image under `./src/images/toolsRegistry/`.
The image should be in landscape mode (e.g. 600px width, 400px height).
You could use the other tools in the registry as template in case something is unclear.


