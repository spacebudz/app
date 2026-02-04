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
