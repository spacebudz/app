import { Address, Lucid } from "../deps.js";
import * as D from "./contract.types.js";
export declare function fromAddress(address: Address): D.Address;
export declare function toAddress(address: D.Address, lucid: Lucid): Address;
