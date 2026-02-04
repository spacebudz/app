import { Address, Assets, Lucid, UTxO } from "../deps.js";
import * as D from "./contract.types.js";
export declare function idToBud(id: number): string;
export declare function colorToBerry(color: string): string;
export declare function idToMatrix(id: number): string;
export declare function sortDesc(a: UTxO, b: UTxO): number;
export declare function sortAsc(a: UTxO, b: UTxO): number;
export declare function toOwner({ address, data }: {
    address?: Address;
    data?: D.Address;
}): string;
export declare function fromAddress(address: Address): D.Address;
export declare function toAddress(address: D.Address, lucid: Lucid): Address;
export declare function fromAssets(assets: Assets): D.Value;
export declare function toAssets(value: D.Value): Assets;
export declare function checkVariableFee(fee: number): bigint;
