import * as React from "react";
import { Button, createToast, Input, Spinner, toast } from "../../components";
import { Dialog } from "../../components/Dialog";
import { fromLovelaceDisplay, toLovelace } from "../../utils";
import { ExternalLink } from "@styled-icons/evaicons-solid/ExternalLink";
import secrets from "../../../secrets";
import NumberFormat from "react-number-format";

type BotType = "sold" | "bought" | "bid" | "list";

type Confirm = {
  type: "CancelBid" | "CancelListing" | "Sell" | "Buy" | null;
  lovelace: BigInt | null;
};

type ConfirmDialogProps = {
  market: any;
  budId: number;
  details: any;
  checkTx: ({ type: BotType, txHash: string, lovelace: BigInt }) => void;
};

export const ConfirmDialog = React.forwardRef(
  ({ market, budId, details, checkTx }: ConfirmDialogProps, ref: any) => {
    const [confirm, setConfirm] = React.useState<Confirm>({
      type: null,
      lovelace: null,
    });
    const [loading, setLoading] = React.useState(false);
    const dialogRef = React.useRef<any>();

    React.useImperativeHandle(ref, () => ({
      open: (confirm: Confirm) => {
        setConfirm(confirm);
        dialogRef.current.open();
      },
      close: () => dialogRef.current.close(),
    }));

    const title =
      (confirm.type === "CancelBid" && "Cancel bid") ||
      (confirm.type === "CancelListing" && "Cancel listing") ||
      (confirm.type === "Sell" && "Sell") ||
      (confirm.type === "Buy" && "Buy");

    const content =
      (confirm.type === "CancelBid" && (
        <span>
          Are you sure you want to cancel your offer of{" "}
          <span className="font-bold text-violet-400 inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>{" "}
          on <span className="font-bold inline-block">SpaceBud #{budId}</span>?
        </span>
      )) ||
      (confirm.type === "CancelListing" && (
        <span>
          Are you sure you want to cancel your listing of{" "}
          <span className="font-bold text-violet-400 inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>{" "}
          on <span className="font-bold inline-block">SpaceBud #{budId}</span>?
        </span>
      )) ||
      (confirm.type === "Sell" && (
        <span>
          Are you sure you want to sell{" "}
          <span className="font-bold inline-block">SpaceBud #{budId}</span> for{" "}
          <span className="font-bold text-orange-400 break-after-all inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>
          ?
        </span>
      )) ||
      (confirm.type === "Buy" && (
        <span>
          Are you sure you want to buy{" "}
          <span className="font-bold inline-block">SpaceBud #{budId}</span> for{" "}
          <span className="font-bold text-violet-400 inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>
          ?
        </span>
      ));

    const onConfirm = async () => {
      setLoading(true);
      let txHash: string;
      if (confirm.type === "Buy") {
        txHash = await market
          .buy(details.listing.listingUtxo)
          .catch((e) => tradeErrorHandler(e));
      } else if (confirm.type === "Sell") {
        txHash = await market
          .sell(details.bid.bidUtxo)
          .catch((e) => tradeErrorHandler(e));
      } else if (confirm.type === "CancelBid") {
        txHash = await market
          .cancelBid(details.bid.bidUtxo)
          .catch((e) => tradeErrorHandler(e));
      } else if (confirm.type === "CancelListing") {
        txHash = await market
          .cancelOffer(details.listing.listingUtxo)
          .catch((e) => tradeErrorHandler(e));
      }
      setLoading(false);
      if (!txHash) return;
      checkTx({
        txHash,
        type:
          (confirm.type === "Buy" && "bought") ||
          (confirm.type === "Sell" && "sold"),
        lovelace: confirm.lovelace,
      });
      dialogRef.current.close();
    };
    return (
      <Dialog ref={dialogRef} onClose={() => setLoading(false)}>
        <div className="w-full flex flex-col items-center">
          <div className="w-full text-2xl font-semibold mb-4">{title}</div>
          <div className="w-full self-start mb-8 text-md">
            <div>{content}</div>
            {(confirm.type === "Buy" || confirm.type === "Sell") && (
              <div className="mt-2 text-xs">Service fee: 2.4%</div>
            )}
          </div>
          <div className="w-full flex justify-end">
            <Button loading={loading} className="mr-2" onClick={onConfirm}>
              Confirm
            </Button>
            <Button theme="space" onClick={() => dialogRef.current.close()}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
);

type Trade = {
  type: "List" | "Offer" | null;
  minAda: BigInt;
};

export const TradeDialog = React.forwardRef(
  ({ market, budId, details, checkTx }: ConfirmDialogProps, ref: any) => {
    const [trade, setTrade] = React.useState<Trade>({
      type: null,
      minAda: BigInt(0),
    });
    const [loading, setLoading] = React.useState(false);
    const [value, setValue] = React.useState("");
    const dialogRef = React.useRef<any>();

    const title =
      (trade.type === "List" && "List") ||
      (trade.type === "Offer" && "Make offer");

    const explain =
      (trade.type === "List" && (
        <>
          {" "}
          Type in the amount of ADA you wish to list{" "}
          <span className="font-bold inline-block">SpaceBud #{budId}</span> for.
        </>
      )) ||
      (trade.type === "Offer" && (
        <>
          {" "}
          Type in the amount of ADA you wish to make an offer for
          <span className="font-bold inline-block">SpaceBud #{budId}</span>.
        </>
      ));

    React.useImperativeHandle(ref, () => ({
      open: (type: Trade) => {
        setTrade(type);
        dialogRef.current.open();
      },
      close: () => dialogRef.current.close(),
    }));

    const onConfirm = async () => {
      setLoading(true);
      const lovelace = toLovelace(value);
      let txHash: string;
      if (trade.type === "List") {
        txHash = await market
          .offer(budId, lovelace.toString())
          .catch((e) => tradeErrorHandler(e));
      } else if (trade.type === "Offer") {
        txHash = await market
          .bid(details.bid.bidUtxo, lovelace.toString())
          .catch((e) => tradeErrorHandler(e));
      }
      setLoading(false);
      if (!txHash) return;
      checkTx({
        txHash,
        type:
          (trade.type === "List" && "list") ||
          (trade.type === "Offer" && "bid"),
        lovelace,
      });
      dialogRef.current.close();
    };

    return (
      <Dialog ref={dialogRef}>
        <div className="w-full flex flex-col items-center">
          <div className="w-full text-2xl font-semibold mb-4">{title}</div>
          <div className="mb-6 w-full font-light text-left self-start max-w-md">
            {explain}
          </div>
          <div className="w-3/4 max-w-[260px]">
            <NumberFormat
              theme="space"
              placeholder="Amount"
              rightEl={"₳"}
              customInput={Input}
              allowNegative={false}
              thousandsGroupStyle="thousand"
              decimalSeparator="."
              displayType="input"
              type="text"
              thousandSeparator={true}
              decimalScale={6}
              allowEmptyFormatting={true}
              value={value}
              onValueChange={({ value }) => {
                setValue(value);
              }}
            />
          </div>
          <div className="text-sm mt-2 font-light">
            {trade.type === "Offer" &&
            value &&
            toLovelace(value) >= BigInt(70000000) &&
            toLovelace(value) <= BigInt(100000000) ? (
              <span className="font-bold">Don't even try...</span>
            ) : (
              <span>
                Minimum{" "}
                <span className="font-bold">
                  {fromLovelaceDisplay(trade.minAda)}
                </span>
              </span>
            )}
          </div>
          <div className="w-full flex justify-end mt-10">
            <Button
              disabled={!value || trade.minAda > toLovelace(value)}
              loading={loading}
              className="mr-2"
              onClick={onConfirm}
            >
              Confirm
            </Button>
            <Button theme="space" onClick={() => dialogRef.current.close()}>
              Cancel
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }
);

const failedTxToast = (error: string) => {
  return createToast({
    children: (
      <div className="w-full h-full flex justify-start flex-col">
        <div className="text-lg font-bold">Transaction failed</div>
        <div className="text-sm">{error}</div>
      </div>
    ),
    theme: "rose",
    duration: 8000,
  });
};

const pendingTxToast = () => {
  return createToast({
    children: (
      <div className="w-full h-full flex justify-between items-center">
        <div className="text-lg font-bold">Transaction pending</div>
        <Spinner className="mr-2" />
      </div>
    ),
    theme: "space",
    duration: Infinity,
  });
};

const successTxToast = (txHash: string) => {
  return createToast({
    children: (
      <div className="w-full h-full flex justify-between items-center">
        <div className="text-lg font-bold">Transaction successful</div>
        <ExternalLink
          className="stroke-1 stroke-white mr-2 cursor-pointer"
          size={22}
          onClick={() =>
            window.open(`https://cardanoscan.io/transaction/${txHash}`)
          }
        />
      </div>
    ),
    duration: 5000,
  });
};

export const checkTx = async ({ txHash, type, lovelace, budId, market }) => {
  if (!txHash) return;
  pendingTxToast();
  if (type) {
    fetch("https://api.spacebudzbot.com/tweet", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + secrets.TWITTER_BOT_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: budId.toString(),
        type,
        lovelace: lovelace.toString(),
      }),
    })
      .then(console.log)
      .catch(console.log);
  }
  await market.awaitConfirmation(txHash);
  toast.dismiss();
  successTxToast(txHash);
  await new Promise((res, rej) => setTimeout(() => res(1), 1000));
  const event = new Event("confirm");
  window.dispatchEvent(event);
};

const tradeErrorHandler = (e) => {
  console.log(e);
  if (e.message) {
    if (e.message.includes("budget was overspent"))
      failedTxToast("Execution units too low.");
    else if (e.message.includes("BadInputs"))
      failedTxToast("Trade in use, try again.");
    else if (e.message.includes("INPUTS_EXHAUSTED"))
      failedTxToast(
        "Insufficent balance. Send more ADA to your wallet or use a different one."
      );
    else if (e.message.includes("INPUT_LIMIT_EXCEEDED"))
      failedTxToast(
        "Too many UTxOs. Reduce wallet size by sending out tokens to another wallet or consolidate wallet."
      );
    else if (e.message.includes("MAX_SIZE_REACHED"))
      failedTxToast(
        "Size too large. Reduce wallet size by sending out tokens to another wallet."
      );
    else if (e.message.includes("NO_COLLATERAL"))
      failedTxToast(
        "Collateral not set. Open up your wallet and set the collateral first."
      );
  } else if (e.info) {
    failedTxToast(e.info);
  } else {
    if (e.includes("NFTs"))
      failedTxToast(
        "Size too large. Reduce wallet size by sending out tokens to another wallet."
      );
    else failedTxToast("Something went wrong");
  }
};
