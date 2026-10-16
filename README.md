## [Deprecated]

#### Setup

Node.js 14

##### Install
```
npm install --python=/usr/bin/python2.7
```
(Do not remove the package-lock.json)

##### Dev server
```
npm start
```

##### Build
```
npm run build
```
##### Deploy
You need to login first with `firebase login`
````
firebase deploy
````

##### Secrets
Create a file `secrets.js` at the root of the project

```js
export default {
  PROJECT_ID: "<BLOCKFROST API KEY>",
  ACCESS_TOKEN_IPFS: "<PINATA_API_KEY>",
};
```

## Cancel and migrate fix (October 2026)

### What was wrong

Cancelling a listing of an old SpaceBud and migrating to the new collection (wormhole) failed with
"Transaction failed – Something went wrong".

Cause: Cardano mainnet's PlutusV1/V2 cost models grew to 332 values (protocol 11). The libraries those flows
used, `lucid-cardano@0.10.9` and the serialization lib built into `src/cardano/market/custom_modules`, only accept
166 and throw the plain string `CostModel operation 166 out of bounds. Max is 166`. The error handler
(`tradeErrorHandler` in `src/parts/spacebud/Dialog.tsx`) turns every unknown string into "Something went wrong".
The same error also makes `Lucid.new()` fail, so everything that uses `getLucid()`, `getNebula()` or `getWormhole()`
(Nebula buy/sell/bid, `checkTx`, the SpaceBud detail pages) is very likely still broken.

### What changed

Two standalone flows on [Lucid Evolution](https://github.com/Anastasia-Labs/lucid-evolution) (CML 6, which accepts
long cost models). **The old logic was not removed**: `src/cardano/market`, `vendor/` (including the Wormhole and
Nebula contracts) and the old branches in `Dialog.tsx` / `profile.tsx` are untouched.

| File | Purpose |
| --- | --- |
| `src/parts/spacebud/legacyCancel.ts` | Cancel a listing on the legacy marketplace contract (PlutusV1). |
| `src/parts/spacebud/legacyMigrate.ts` | Wormhole migration. Port of `Contract.migrate()` from `vendor/@spacebudz/wormhole`. |
| `src/parts/spacebud/legacyShared.ts` | Lazy library loader, Blockfrost fetch, error unwrapping, tx confirmation polling. |

UI:
- One **Cancel** button per listing. Listings of old SpaceBudz (not Nebula) use the fixed flow, listings of the new
  collection (Nebula) still use the old logic.
- One **Migrate** button per old SpaceBud and one **Migrate multiple** button in the banner, both using the fixed flow.
- `USE_NEW_TX_LOGIC` in `src/config.ts` switches the buttons back to the old logic.
- The fixed flows have their own confirmation polling (`checkLegacyTx`), because `checkTx` needs the broken `Lucid.new()`.

### Good to know

- **Never truncate the cost model.** The script data hash is calculated from the full model. A truncated one is
  rejected by the node.
- **Cancel**: spends the listing UTxO of the legacy contract (`addr1wyzynye0…`) with the owner as required signer.
  The SpaceBud goes back to the wallet. Verified on mainnet: #949 was cancelled with the new flow
  (tx `7089c85f91ddd44c55e03b2979c27ade2cb7b87b5b0e51744fec07f439b8e483`).
- **Migrate** (also verified on mainnet):
  - At most **7 SpaceBudz per transaction** (the mint script's execution budget). The flow retries with one less if
    a batch does not fit.
  - Costs: a network fee (about 0.55 ₳ for one) plus about 1.2 ₳ min-ADA that stays in the contract's reference output
    of every migrated SpaceBud.
  - The old SpaceBud is locked in the wormhole lock contract. The holder can unlock it again by burning the new pair
    (contract rule, there is no UI for it).
  - The old flow's animation was dropped: its video (`wormhole.mp4`) was removed from the site, so the old animation
    would leave a stuck full-screen overlay.
  - The datum of each reference NFT is encoded by hand (map keys in insertion order, hash as in the Merkle tree).
    Do not change that: it was verified against all 10,000 Merkle leaves, and the derived policy id and lock address
    are checked at runtime against `POLICY_ID` / `LOCK_ADRESS` in `src/config.ts`.
  - Compared with the official repo https://github.com/spacebudz/wormhole: compiled scripts, Merkle data, metadata
    and config are identical to `vendor/@spacebudz/wormhole`.
- Listings in `src/api.ts` are a static snapshot (August 2025). The lookup for the fixed cancel flow is done
  on-chain, so a listing that was sold or cancelled since then shows a clear message.

### Build notes

- `package-lock.json` is lockfile v1: install with Node 14 / npm 6. npm 6 rewrites the `file:vendor/@spacebudz/nebula`
  and `file:vendor/@spacebudz/wormhole` entries of the lockfile to a bogus `file:https:/registry…` string. Change those
  two lines back after every install.
- `gatsby-node.js`: `@lucid-evolution` and `@noble/hashes` are replaced by Gatsby's null loader in the SSR stages. They
  are only used in the browser (on click) and import `node:crypto`, which the SSR bundle cannot resolve.
- `tsconfig.json` (`paths`) and `src/types/lucid-evolution.d.ts`: the library's types need a newer TypeScript than
  the 4.5 used here, so TypeScript is pointed to a stub.
- Lucid Evolution is loaded lazily (own chunk of about 2 MB), so it does not slow down the first page load.
- A full build can take 10+ minutes on a busy machine.
- Deploy: the Firebase CLI (v15) needs Node 20. Use `firebase deploy --only hosting` (log in with `firebase login --reauth`
  if the credentials expired).

### How it was tested

Nothing is signed or submitted by the tests. A scratch harness used mock CIP-30 wallets built from real mainnet
holders, with `signTx` as a tripwire: the transaction is built, evaluated by Blockfrost (Ogmios), its script data hash
compared with an independent calculation, and asset conservation is checked (everything that goes in comes out,
the new NFT goes to the owner, the old one only into the lock output). The UI was checked in a browser against the
production build with a mock wallet.

### Other findings (no code changes)

- The Blockfrost key in `secrets.js` is bundled into the client JS, so it is public.
- The Firebase Cloud Function `api` (us-central1) is not used by the site anymore. Something outside this project
  polls `/api/v2v3/listings` every minute. Its source is not in this repo, and its Node.js 20 runtime is decommissioned
  on 2026-10-30.
