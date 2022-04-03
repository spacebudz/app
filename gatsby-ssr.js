import wrapWithProvider from "./wrap-with-provider";
import { btoa, atob } from "buffer";
export const wrapRootElement = wrapWithProvider;

// required for web3 library during SSR
process.binding = (name) => name;
global.btoa = btoa;
global.atob = atob;
