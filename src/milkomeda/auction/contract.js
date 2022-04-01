import { abi } from "./abi";
import Web3 from "web3";

let web3;
let contract;
const contractAddress = "0x147f99A8632009ED9D96525a50b39d24ea5d2556";

export const checkCompatible = async () => {
  // Modern dapp browsers...
  if (window.ethereum || window.web3) {
    web3 = new Web3(window.web3.currentProvider);
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

export const deadline = async () => {
  let result = await contract.methods.deadline().call();
  return result;
};

export const hasStarted = async () => {
  let result = await contract.methods.hasStarted().call();
  return result;
};

export const getAuction = async (nftIndex) => {
  let result = await contract.methods.getAuction(nftIndex).call();
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

export const bid = (nftIndex, receivingAddress, value) => {
  return contract.methods
    .bid(nftIndex, receivingAddress)
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
