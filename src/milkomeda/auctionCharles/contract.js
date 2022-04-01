import { abi } from "./abi";
import Web3 from "web3";

let web3;
let contract;
const contractAddress = "0x4bc2a3F35FAa316f190fAa95602639003c1e9A09";

export const checkCompatible = async () => {
  // Modern dapp browsers...
  if (window.ethereum || window.web3) {
    web3 = new Web3((window.web3 || window.ethereum).currentProvider);
    contract = new web3.eth.Contract(abi, contractAddress);
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

export const addNetwork = async () => {
  const params = {
    chainId: "0x" + (2001).toString(16), // A 0x-prefixed hexadecimal string
    chainName: "Milkomeda",
    nativeCurrency: {
      name: "ADA",
      symbol: "ADA", // 2-6 characters long
      decimals: 18,
    },
    rpcUrls: "https://rpc-mainnet-cardano-evm.c1.milkomeda.com ",
    blockExplorerUrls: [
      "https://explorer-mainnet-cardano-evm.c1.milkomeda.com",
    ],
  };

  window.web3.eth.getAccounts((error, accounts) => {
    window.ethereum
      .request({
        method: "wallet_addEthereumChain",
        params: [params, accounts[0]],
      })
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

export const deadline = async () => {
  const result = await contract.methods.deadline().call();
  return result;
};

export const hasStarted = async () => {
  const result = await contract.methods.hasStarted().call();
  return result;
};

export const getAuction = async () => {
  const result = await contract.methods.getAuction().call();
  return {
    receivingAddress: result.receivingAddress,
    bidAmount: web3.utils.fromWei(result.bidAmount, "ether"),
    owner: result.owner,
  };
};

export const start = (numberOfDays) => {
  return contract.methods
    .start(numberOfDays)
    .send({
      from: window.ethereum.selectedAddress,
      gas: 3000000,
    })
    .then(() => console.log("Successfully started!"));
};

export const bid = (receivingAddress, value) => {
  return contract.methods
    .bid(receivingAddress)
    .send({
      from: window.ethereum.selectedAddress,
      value: web3.utils.toWei(value.toString(), "ether"),
      gas: 3000000,
    })
    .then(() => console.log("Successfully bid!"));
};

export const withdraw = () => {
  return contract.methods
    .widthdraw()
    .send({
      from: window.ethereum.selectedAddress,
      gas: 3000000,
    })
    .then(() => console.log("Successfully withdrawn!"));
};
