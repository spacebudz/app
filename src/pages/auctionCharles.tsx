import * as React from "react";
import NumberFormat from "react-number-format";
import { Button, Image, Input } from "../components";
import { MainLayout } from "../layouts/mainLayout";
import {
  addNetwork,
  BID_STEP,
  checkCompatible,
  contractAddress,
  fromWei,
  getAuction,
  getDeadline,
  isValidCardanoAddress,
  loadContract,
  makeBid,
  NETWORK_ID,
  toWei,
} from "../milkomeda/auctionCharles/contract";
import { ipfsToHttps, isBrowser } from "../utils";

const AuctionCharles = () => {
  const [loading, setLoading] = React.useState(false);
  const [loadingBid, setLoadingBid] = React.useState(false);
  const [connected, setConnected] = React.useState(false);
  const [data, setData] = React.useState({
    deadline: 0,
    bidAmountAda: "",
    bidAmountLovelace: BigInt(0),
  });

  const [bid, setBid] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);

  const image = "ipfs://QmZrbjUYm6G8wJ5A3W5bZ7fw2W7AefkZZ3HcX6cVd4y6j4";

  const init = async () => {
    await loadContract();
    const deadline = await getDeadline();
    const auction = await getAuction();
    setData({
      deadline: parseInt(deadline) * 1000,
      bidAmountAda: auction.bidAmountAda,
      bidAmountLovelace: auction.bidAmountLovelace,
    });
  };

  React.useEffect(() => {
    init();
    const interval = setInterval(() => {
      init();
    }, 8000);
    if (window.ethereum) {
      setConnected(
        window.ethereum.selectedAddress &&
          window.ethereum.networkVersion == NETWORK_ID
      );
    }
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <MainLayout title="SpaceBudz | Auction" titleTwitter="SpaceBudz: Auction">
      <div className="flex items-center flex-col mb-40">
        <div className="font-title text-3xl font-bold text-center">
          Auction <br />
          SpaceBud #1421
        </div>
        <Button
          className="mt-10"
          disabled={connected}
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await checkCompatible();
            await addNetwork();
            await new Promise((res, rej) => setTimeout(() => res(1), 1000));
            if (
              window.ethereum.selectedAddress &&
              window.ethereum.networkVersion == NETWORK_ID
            )
              setConnected(true);
            setLoading(false);
          }}
        >
          Connect MetaMask
        </Button>
        <div className="mt-10 mb-4 text-lg">
          Live until{" "}
          <span className="font-semibold">
            {data.deadline
              ? Date.now() > data.deadline
                ? "ENDED"
                : new Date(data.deadline).toLocaleString()
              : "..."}
          </span>
        </div>
        <div className="w-[400px] max-w-[90%] pb-8 rounded-xl border-2 border-b-4 flex items-center flex-col">
          <div className="w-90% pb-[100%] h-0 w-full relative">
            <div className="absolute top-0 left-0 w-full h-full">
              <Image src={ipfsToHttps(image)} className="w-full h-full" />
            </div>
          </div>
          <div className="-mt-6 text-lg">Current bid</div>
          <div className="text-lg font-semibold">
            {data.bidAmountAda ? data.bidAmountAda : "..."}
          </div>
          <NumberFormat
            classNameContainer="w-3/4 mt-4"
            theme="white"
            placeholder="Bid amount"
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
            value={bid}
            onValueChange={({ value }) => {
              setBid(value);
            }}
          />
          <Input
            classNameContainer="w-3/4 mt-2"
            theme="white"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Receiving Cardano address (addr...)"
          />
          <Button
            theme="orange"
            className="mt-8 w-2/4"
            loading={loadingBid}
            disabled={
              isBrowser() &&
              (!window.ethereum ||
                !window.ethereum.selectedAddress ||
                window.ethereum.networkVersion != NETWORK_ID ||
                Date.now() > data.deadline ||
                !bid ||
                !address)
            }
            onClick={async () => {
              setError("");
              setLoadingBid(true);
              try {
                if (!isValidCardanoAddress(address)) {
                  throw new Error("Not a valid Cardano address");
                }
                if (toWei(bid) < data.bidAmountLovelace + BID_STEP) {
                  throw new Error(
                    `Bid needs to be at least ${fromWei(
                      data.bidAmountLovelace + BID_STEP
                    )}`
                  );
                }

                await makeBid(address, bid)
                  .then(() => setSuccess(true))
                  .catch((e) => {});
              } catch (e) {
                setError(e.message);
              }
              setLoadingBid(false);
            }}
          >
            Bid
          </Button>
          {success && (
            <div className="mt-2 text-sm text-primary">Successfully bid</div>
          )}
          {error && <div className="mt-2 text-sm text-rose-400">{error}</div>}
        </div>
        <a
          className="mt-4 underline text-primary"
          href={`https://explorer-mainnet-cardano-evm.c1.milkomeda.com/address/${contractAddress}/transactions`}
          target="_blank"
        >
          Contract
        </a>
        <div className="mt-4 font-light">
          All funds will go into the community wallet
        </div>
        <div className="mt-10 font-bold text-xl mb-6">How it works</div>
        <div className="w-[600px] max-w-[90%]">
          <div className="mb-2">
            The auction takes place on{" "}
            <a
              className="underline text-primary"
              href="https://www.milkomeda.com/"
              target="_blank"
            >
              Milkomeda
            </a>
            . A{" "}
            <a
              className="underline text-orange-500"
              href="https://metamask.io/"
              target="_blank"
            >
              MetaMask
            </a>{" "}
            wallet is required for that.
          </div>
          <div className="mb-2">
            After you installed MetaMask, click <b>Connect MetaMask</b>. This
            will connect the wallet to the website and switch it to the
            Milkomeda network.
          </div>
          <div className="mb-2">
            To fund your MetaMask wallet, you can use{" "}
            <a
              className="underline text-orange-500"
              href="https://flint-wallet.com/"
              target="_blank"
            >
              Flint
            </a>{" "}
            or{" "}
            <a
              className="underline text-teal-500"
              href="https://namiwallet.io/"
              target="_blank"
            >
              Nami
            </a>
            . Simply copy your MetaMask address and send ADA there with Flint or
            Nami.
          </div>
          <div className="mb-2">
            Now you are ready to bid. In order to bid, you need to specify a bid
            amount, which needs to be at least 100 ADA higher than the current
            bid, and a Cardano receiving address, where you will receive{" "}
            <b>SpaceBud #1421</b> in case your bid remains the last and highest
            one until the auction is over.
          </div>
          <div>
            The current bidder is automtically refunded when a higher bid
            occurs.
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AuctionCharles;
