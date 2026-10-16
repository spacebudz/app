/**
 * Helpers shared by the standalone legacy flows (legacyCancel.ts, legacyMigrate.ts).
 *
 * Those flows exist because mainnet's PlutusV1/V2 cost models now have 332 values, but the old
 * tx libraries (lucid-cardano@0.10.9 and the legacy market's built-in one) cap them at 166 and
 * throw "CostModel operation 166 out of bounds". They therefore use Lucid Evolution (CML 6).
 */
import { baseUrl, projectId } from "../../api";

// Loaded on first use only, so the (large) library stays out of the main bundle.
let lucidModule: Promise<any> | undefined;
export const loadLucid = (): Promise<any> => {
  if (!lucidModule) {
    lucidModule = import(
      /* webpackChunkName: "legacy-cancel" */ "@lucid-evolution/lucid"
    );
  }
  return lucidModule;
};

/** Blockfrost GET/POST. Resolves to null on 404, throws on any other error. */
export const blockfrost = async (path: string, init?: any): Promise<any> => {
  const res = await fetch(baseUrl + path, {
    ...init,
    headers: { project_id: projectId, ...(init && init.headers) },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Blockfrost request failed (${res.status})`);
  return res.json();
};

// Lucid Evolution runs on Effect: promise rejections are a FiberFailure whose message is just
// `${cause}` ("[object Object]" for CIP-30 {code, info} errors). The original error is kept
// under this symbol, so we dig it out to show the wallet's / builder's real message.
const EFFECT_CAUSE = Symbol.for("effect/Runtime/FiberFailure/Cause");
export const unwrapError = (e: any): any => {
  const root = (c: any): any =>
    c == null
      ? undefined
      : c.error !== undefined
      ? c.error
      : c.defect !== undefined
      ? c.defect
      : root(c.left) ?? root(c.right);
  const failure = e && e[EFFECT_CAUSE] ? root(e[EFFECT_CAUSE]) : undefined;
  if (failure === undefined) return e;
  return failure.cause !== undefined ? failure.cause : failure;
};

/** Resolves once the tx is on-chain (polls Blockfrost; does not depend on the old Lucid). */
export const waitForLegacyTx = async (
  txHash: string,
  { intervalMs = 5000, timeoutMs = 20 * 60 * 1000 } = {}
): Promise<void> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await blockfrost(`/txs/${txHash}`)) return;
    } catch (e) {}
    await new Promise((res) => setTimeout(res, intervalMs));
  }
  throw new Error("Timed out waiting for the transaction to be confirmed.");
};

/** Turns whatever the wallet / CML / Blockfrost threw into a readable message. */
export const legacyErrorMessage = (e: any): string => {
  console.log(e);
  const err = unwrapError(e);
  if (typeof err === "string") return err;
  if (err && err.info) return String(err.info); // CIP-30 error: { code, info }
  if (err && err.message && err.message !== "[object Object]")
    return String(err.message);
  return "Something went wrong";
};
