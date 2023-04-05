import * as React from "react";
import { Button, createToast, Input, Spinner, toast } from "../../components";
import { Dialog } from "../../components/Dialog";
import {
  findAsync,
  fromLovelaceDisplay,
  getLucid,
  getNebula,
  getSelectedWallet,
  idToBud,
  toLovelace,
} from "../../utils";
import { ExternalLink } from "@styled-icons/evaicons-solid/ExternalLink";
import NumberFormat from "react-number-format";
import { Wormhole } from "../../components/Wormhole";
import { paymentCredentialOf } from "lucid-cardano";
import * as Nebula from "@spacebudz/nebula";

type Confirm = {
  type: "CancelBid" | "CancelListing" | "Sell" | "Buy" | "Wormhole" | null;
  lovelace: bigint | null;
  market: any;
  wormhole?: { contract: any; ids: number[] };
  isNebula: boolean;
  details: any;
  budId: number;
};

type ConfirmDialogProps = {
  checkTx: ({ txHash }: { txHash: string }) => void;
};

export const ConfirmDialog = React.forwardRef(
  ({ checkTx }: ConfirmDialogProps, ref: any) => {
    const [confirm, setConfirm] = React.useState<Confirm>({
      type: null,
      lovelace: null,
      market: null,
      isNebula: true,
      details: null,
      budId: null,
    });

    React.useEffect(() => {}, []);

    const [loading, setLoading] = React.useState(false);
    const dialogRef = React.useRef<any>();
    const [startWormhole, setStartWormhole] = React.useState(false);

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
      (confirm.type === "Buy" && "Buy") ||
      (confirm.type === "Wormhole" && "Wormhole");
    const content =
      (confirm.type === "CancelBid" && (
        <span>
          Are you sure you want to cancel your offer of{" "}
          <span className="font-bold text-violet-400 inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>{" "}
          on{" "}
          <span className="font-bold inline-block">
            SpaceBud #{confirm.budId}
          </span>
          ?
        </span>
      )) ||
      (confirm.type === "CancelListing" && (
        <span>
          Are you sure you want to cancel your listing of{" "}
          <span className="font-bold text-violet-400 inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>{" "}
          on{" "}
          <span className="font-bold inline-block">
            SpaceBud #{confirm.budId}
          </span>
          ?
        </span>
      )) ||
      (confirm.type === "Sell" && (
        <span>
          Are you sure you want to sell{" "}
          <span className="font-bold inline-block">
            SpaceBud #{confirm.budId}
          </span>{" "}
          for{" "}
          <span className="font-bold text-orange-400 break-after-all inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>
          ?
        </span>
      )) ||
      (confirm.type === "Buy" && (
        <span>
          Are you sure you want to buy{" "}
          <span className="font-bold inline-block">
            SpaceBud #{confirm.budId}
          </span>{" "}
          for{" "}
          <span className="font-bold text-violet-400 inline-block">
            {fromLovelaceDisplay(confirm.lovelace)}
          </span>
          ?
        </span>
      )) ||
      (confirm.type === "Wormhole" && (
        <span>
          {confirm.wormhole!.ids.length > 1 ? (
            <>
              A selection of SpaceBudz will embark on a journey through the
              wormhole. These individuals will be carefully chosen from among
              your collection. A group of approximately 4-7 will be able to make
              the journey in each transaction.
            </>
          ) : (
            <>
              SpaceBud #{confirm.wormhole!.ids[0]} will embark on an
              unforgettable adventure through the wormhole.
            </>
          )}
        </span>
      ));

    const [wormholeIds, setWormholeIds] = React.useState([]);

    const onConfirm = async () => {
      setLoading(true);
      let txHash: string | void;
      if (confirm.type === "Buy") {
        if (confirm.isNebula) {
          txHash = await confirm.market
            .buy([confirm.details.listing.listingUtxo])
            .catch((e: any) => tradeErrorHandler(e));
        } else {
          txHash = await confirm.market
            .buy(confirm.details.listing.listingUtxo)
            .catch((e: any) => tradeErrorHandler(e));
        }
      } else if (confirm.type === "Sell") {
        if (confirm.isNebula) {
          txHash = await confirm.market
            .sell([{ bidUtxo: confirm.details.bid.bidUtxo }])
            .catch((e: any) => tradeErrorHandler(e));
        } else {
          txHash = await confirm.market
            .sell(confirm.details.bid.bidUtxo)
            .catch((e: any) => tradeErrorHandler(e));
        }
      } else if (confirm.type === "CancelBid") {
        if (confirm.isNebula) {
          txHash = await confirm.market
            .cancelBid(confirm.details.bid.bidUtxo)
            .catch((e: any) => tradeErrorHandler(e));
        } else {
          txHash = await confirm.market
            .cancelBid(confirm.details.bid.bidUtxo)
            .catch((e: any) => tradeErrorHandler(e));
        }
      } else if (confirm.type === "CancelListing") {
        if (confirm.isNebula) {
          txHash = await confirm.market
            .cancelListing(confirm.details.listing.listingUtxo)
            .catch((e: any) => tradeErrorHandler(e));
        } else {
          txHash = await confirm.market
            .cancelOffer(confirm.details.listing.listingUtxo)
            .catch((e: any) => tradeErrorHandler(e));
        }
      } else if (confirm.type === "Wormhole") {
        setWormholeIds(confirm.wormhole.ids);
        if (confirm.wormhole.ids.length === 1) {
          txHash = await confirm
            .wormhole!.contract.migrate(confirm.wormhole.ids)
            .catch((e: any) => tradeErrorHandler(e));
          setWormholeIds(confirm.wormhole.ids);
        } else {
          // Start with all, then slice of 1, then 2, then throw error
          let userDeclined = false;
          try {
            txHash = await confirm.wormhole!.contract.migrate(
              confirm.wormhole.ids
            );
            setWormholeIds(confirm.wormhole.ids);
          } catch (e) {
            userDeclined = e.code == 2;
            if (userDeclined) tradeErrorHandler(e);
          }
          if (!txHash && !userDeclined) {
            try {
              txHash = await confirm.wormhole!.contract.migrate(
                confirm.wormhole.ids.slice(1)
              );
              setWormholeIds(confirm.wormhole.ids.slice(1));
            } catch (e) {
              userDeclined = e.code == 2;
              if (userDeclined) tradeErrorHandler(e);
            }
          }
          if (!txHash && !userDeclined) {
            txHash = await confirm
              .wormhole!.contract.migrate(confirm.wormhole.ids.slice(2))
              .catch((e: any) => tradeErrorHandler(e));
            setWormholeIds(confirm.wormhole.ids.slice(2));
          }
        }
        if (txHash) setTimeout(() => setStartWormhole(true), 2500);
      }

      setLoading(false);
      if (!txHash) return;
      checkTx({
        txHash,
      });
      dialogRef.current.close();
    };
    return (
      <>
        <Dialog ref={dialogRef} onClose={() => setLoading(false)}>
          <div className="w-full flex flex-col items-center">
            <div className="w-full text-2xl font-semibold mb-4">{title}</div>
            <div className="w-full self-start mb-8 text-md">
              <div>{content}</div>
              {(confirm.type === "Buy" || confirm.type === "Sell") && (
                <div className="mt-2 text-xs">
                  Fee: {(confirm.details.fee * 100).toFixed(2)}%
                </div>
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
        <Wormhole
          ids={wormholeIds}
          hasStarted={startWormhole}
          setHasStarted={setStartWormhole}
        />
      </>
    );
  }
);

type Trade = {
  type: "List" | "Offer" | null;
  minAda: BigInt;
  budId: number;
  owner?: string; // Address
};

export const TradeDialog = React.forwardRef(
  ({ checkTx }: ConfirmDialogProps, ref: any) => {
    const [trade, setTrade] = React.useState<Trade>({
      type: null,
      minAda: BigInt(0),
      budId: null,
      owner: null,
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
          <span className="font-bold inline-block">
            SpaceBud #{trade.budId}
          </span>{" "}
          for.
        </>
      )) ||
      (trade.type === "Offer" && (
        <>
          {" "}
          Type in the amount of ADA you wish to make an offer for
          <span className="font-bold inline-block">
            SpaceBud #{trade.budId}
          </span>
          .
        </>
      ));

    React.useImperativeHandle(ref, () => ({
      open: (trade: Trade) => {
        setTrade(trade);
        dialogRef.current.open();
      },
      close: () => dialogRef.current.close(),
    }));

    const onConfirm = async () => {
      setLoading(true);
      const lovelace = toLovelace(value);
      let txHash: string | void;
      const nebula = await getNebula();
      const lucid = await getLucid();

      const selectedWallet = await getSelectedWallet();
      const selectedWalletAddresses = await selectedWallet.getUsedAddresses();

      // NEBULA (market needs to be Nebula)
      if (trade.type === "List") {
        const listingUtxo = await findAsync(
          await nebula.getListings(idToBud(trade.budId)),
          async (utxo) => {
            const owner = Nebula.toAddress(
              (await lucid.datumOf<Nebula.TradeDatum>(utxo, Nebula.TradeDatum))
                .Listing[0].owner,
              lucid
            );
            return selectedWalletAddresses.some(
              (address) =>
                paymentCredentialOf(address).hash ===
                paymentCredentialOf(owner).hash
            );
          }
        );

        if (listingUtxo) {
          txHash = await nebula
            .changeListing(listingUtxo, lovelace)
            .catch((e) => tradeErrorHandler(e));
        } else {
          txHash = await nebula
            .list([idToBud(trade.budId)], lovelace)
            .catch((e) => tradeErrorHandler(e));
        }
      } else if (trade.type === "Offer") {
        const bidUtxo = await findAsync(
          await nebula.getBids({ assetName: idToBud(trade.budId) }),
          async (utxo) => {
            const owner = Nebula.toAddress(
              (await lucid.datumOf<Nebula.TradeDatum>(utxo, Nebula.TradeDatum))
                .Bid[0].owner,
              lucid
            );
            return selectedWalletAddresses.some(
              (address) =>
                paymentCredentialOf(address).hash ===
                paymentCredentialOf(owner).hash
            );
          }
        );
        // We check if there is an existing bid already from this user. If there is we take this one and updated it, otherwise we create a new utxo.
        if (bidUtxo) {
          txHash = await nebula
            .changeBid(bidUtxo, lovelace)
            .catch((e) => tradeErrorHandler(e));
        } else {
          txHash = await nebula
            .bid([idToBud(trade.budId)], lovelace)
            .catch((e) => tradeErrorHandler(e));
        }
      }
      setLoading(false);
      if (!txHash) return;
      checkTx({
        txHash,
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

export const pendingTxToast = () => {
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

export const successTxToast = (txHash: string) => {
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

export const checkTx = async ({ txHash }) => {
  if (!txHash) return;
  pendingTxToast();

  await (await getLucid()).awaitTx(txHash);
  toast.dismiss();
  successTxToast(txHash);
  await new Promise((res, rej) => setTimeout(() => res(1), 5000));
  const event = new Event("confirm");
  window.dispatchEvent(event);
};

export const tradeErrorHandler = (e) => {
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
