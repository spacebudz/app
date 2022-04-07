import { abi } from "./abi";
import Web3 from "web3";
const S = await import(
  "../../cardano/market/custom_modules/@emurgo/cardano-serialization-lib-browser"
);

export const contractAddress = "0xeDEAD134049EacAe05512F5ff4dD6f918262db6e"; // mainnet
// export const contractAddress = "0xD98f4cce917DF99F914EE3534d68E90e5CAaAfA3";

export const checkCompatible = async () => {
  // Modern dapp browsers...
  if (window.ethereum || window.web3) {
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // Acccounts now exposed
    } catch (error) {
      // User denied account access...
    }
  }
  // Non-dapp browsers...
  else {
    console.log(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
    return false;
  }
  return true;
};

export const NETWORK_ID = 2001; // mainnet
// export let NETWORK_ID = 200101;

export const loadContract = async () => {
  let web3;
  if (
    window.ethereum &&
    window.ethereum.selectedAddress &&
    window.ethereum.networkVersion == NETWORK_ID
  )
    web3 = new Web3((window.web3 || window.ethereum).currentProvider);
  else
    web3 = new Web3(
      NETWORK_ID === 2001
        ? "https://rpc-mainnet-cardano-evm.c1.milkomeda.com"
        : "https://rpc-devnet-cardano-evm.c1.milkomeda.com"
    );
  window.contract = new web3.eth.Contract(abi, contractAddress);
};

export const addNetwork = async () => {
  const params =
    NETWORK_ID === 2001
      ? {
          chainId: "0x" + NETWORK_ID.toString(16), // A 0x-prefixed hexadecimal string
          chainName: "Milkomeda",
          nativeCurrency: {
            name: "ADA",
            symbol: "ADA", // 2-6 characters long
            decimals: 18,
          },
          rpcUrls: ["https://rpc-mainnet-cardano-evm.c1.milkomeda.com"],
          blockExplorerUrls: [
            "https://explorer-mainnet-cardano-evm.c1.milkomeda.com",
          ],
        }
      : {
          chainId: "0x" + (NETWORK_ID as number).toString(16), // A 0x-prefixed hexadecimal string
          chainName: "Milkomeda Testnet",
          nativeCurrency: {
            name: "tADA",
            symbol: "tADA", // 2-6 characters long
            decimals: 18,
          },
          rpcUrls: ["https://rpc-devnet-cardano-evm.c1.milkomeda.com"],
          blockExplorerUrls: [
            "https://explorer-devnet-cardano-evm.c1.milkomeda.com",
          ],
        };
  await window.ethereum
    .request({
      method: "wallet_addEthereumChain",
      params: [params, window.ethereum.selectedAddress],
    })
    .catch((e) => {
      throw new Error("Could not add chain");
    });
};

export const BID_STEP = BigInt("100000000000000000000");

export const toWei = (ada: string): BigInt =>
  BigInt(Web3.utils.toWei(ada, "ether"));

export const fromWei = (lovelace: BigInt | string) =>
  parseFloat(Web3.utils.fromWei(lovelace.toString(), "ether")).toFixed(2) +
  " ₳";

export const isValidCardanoAddress = (address: string): boolean => {
  try {
    const addr = S.Address.from_bech32(address);
    if (addr.network_id() === 1) return true;
    return false;
  } catch (e) {}
  return false;
};

export const getDeadline = async () => {
  const result = await window.contract.methods.deadline().call();
  return result;
};

export const hasStarted = async () => {
  const result = await window.contract.methods.hasStarted().call();
  return result;
};

export const getAuction = async () => {
  const result = await window.contract.methods.getAuction().call();
  return {
    receivingAddress: result.receivingAddress,
    bidAmountAda: fromWei(result.bidAmount),
    bidAmountLovelace: BigInt(result.bidAmount),
    owner: result.owner,
  };
};

export const start = (numberOfDays) => {
  return window.contract.methods
    .start(numberOfDays)
    .send({
      from: window.ethereum.selectedAddress,
      gas: 3000000,
    })
    .then(() => console.log("Successfully started!"));
};

export const makeBid = (receivingAddress, value) => {
  return window.contract.methods
    .makeBid(receivingAddress)
    .send({
      from: window.ethereum.selectedAddress,
      value: Web3.utils.toWei(value.toString(), "ether"),
      gas: 3000000,
    })
    .then(() => console.log("Successfully bid!"));
};

export const withdraw = () => {
  return window.contract.methods
    .widthdraw()
    .send({
      from: window.ethereum.selectedAddress,
      gas: 3000000,
    })
    .then(() => console.log("Successfully withdrawn!"));
};
