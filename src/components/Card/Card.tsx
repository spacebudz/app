import * as React from "react";
import { Link } from "gatsby";
import { Image, Spinner, Button } from "..";
import { useIsIntersecting } from "../../hooks";
import { fromLovelaceDisplay, ipfsToHttps } from "../../utils";
import { OutRef } from "lucid-cardano";

export type NodeContent = {
  budId: number;
  image: string;
  traits?: string[];
  type?: string;
  buy?: BigInt;
  bid?: BigInt;
  mint?: number;
  viewType?: "Normal" | "Bid" | "Listing";
  // Wormhole
  needsToMigrate?: boolean;
  isNebula?: boolean;
  outRef?: OutRef;
};

type Action = {
  type: "Bid" | "Listing" | "Wormhole";
  budId: number;
  outRef?: { txHash: string; outputIndex: number };
  isNebula?: boolean;
};

type CardProps = {
  node: NodeContent;
  highlightBuy?: boolean;
  highligtBid?: boolean;
  // Wormhole
  isOwner?: boolean;
  onAction?: (action: Action) => unknown;
};

export const Card = ({
  node,
  highlightBuy,
  highligtBid,
  isOwner,
  onAction,
}: CardProps) => {
  const ref = React.useRef();
  const isIntersecting = useIsIntersecting(ref, "700px");
  const [imageUpdate, setImageUpdate] = React.useState(true);
  const budId = React.useRef(node.budId);
  const [isLoading, setIsLoading] = React.useState(false);
  React.useEffect(() => {
    if (budId.current !== node.budId) {
      budId.current = node.budId;
      setImageUpdate(false);
      setTimeout(() => setImageUpdate(true));
    }
  }, [node]);

  return (
    <Link
      ref={ref}
      to={`/spacebud/${node.budId}/`}
      target="_self"
      className="w-full pt-[135%] border-2 border-b-4 rounded-xl relative bg-white"
    >
      {isIntersecting && (
        <div className="w-full absolute top-0 left-0 flex flex-col justify-center items-center">
          {isOwner &&
            (!node.viewType || node.viewType === "Normal") &&
            node.needsToMigrate && (
              <Button
                className="absolute top-2 left-2 md:top-4 md:left-4 z-[2]"
                size="xs"
                theme="orange"
                loading={isLoading}
                onClick={async (e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  await onAction({
                    type: "Wormhole",
                    budId: node.budId,
                    outRef: node.outRef,
                  });
                  setIsLoading(false);
                }}
              >
                Migrate
              </Button>
            )}
          {isOwner && node.viewType === "Bid" && (
            <Button
              className="absolute top-2 left-2 md:top-4 md:left-4 z-[2]"
              size="xs"
              theme="rose"
              loading={isLoading}
              onClick={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                await onAction({
                  type: "Bid",
                  budId: node.budId,
                  outRef: node.outRef,
                  isNebula: node.isNebula,
                });
                setIsLoading(false);
              }}
            >
              Cancel
            </Button>
          )}
          {isOwner && node.viewType === "Listing" && (
            <Button
              className="absolute top-2 left-2 md:top-4 md:left-4 z-[2]"
              size="xs"
              theme="rose"
              loading={isLoading}
              onClick={async (e) => {
                e.preventDefault();
                setIsLoading(true);
                await onAction({
                  type: "Listing",
                  budId: node.budId,
                  outRef: node.outRef,
                  isNebula: node.isNebula,
                });
                setIsLoading(false);
              }}
            >
              Cancel
            </Button>
          )}
          {isOwner && (!node.isNebula || node.needsToMigrate) && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-[2] text-slate-600 text-sm">
              OLD
            </div>
          )}
          <div className="w-full pb-[100%] relative">
            <div className="w-full h-full absolute top-0 left-0 flex justify-center items-center">
              <Spinner theme="slate" className="w-4 md:w-6 opacity-90" />
            </div>
            {imageUpdate && (
              <div className="absolute left-0 top-0 w-full h-full hover:scale-[102%] duration-200 will-change-transform">
                <Image
                  className={
                    node.needsToMigrate ? "brightness-[14%] blur-md" : ""
                  }
                  threshold={700}
                  src={ipfsToHttps(node.image)}
                />
              </div>
            )}
          </div>
          <div className="-mt-8 md:-mt-10 pl-3 md:pl-4 lg:pl-8 text-slate-900 font-title font-bold text-sm  md:text-lg w-full z-[1]">
            #{node.budId}
          </div>
          <div
            className={`w-4/5 mt-2  md:mt-4 border-2 border-b-4 px-2 py-1 rounded-xl font-bold text-xs md:text-sm lg:text-base ${
              node.buy && highlightBuy
                ? "bg-primary border-violet-600 text-white"
                : "bg-white text-slate-900"
            }`}
          >
            <span className="mr-4">Buy</span>
            {node.buy ? fromLovelaceDisplay(node.buy, { compact: true }) : "-"}
          </div>
          <div
            className={`w-4/5 mt-1 md:mt-2 border-2 border-b-4 px-2 py-1 rounded-xl font-bold text-xs md:text-sm lg:text-base ${
              node.bid && highligtBid
                ? "bg-orange-500 border-orange-600 text-white"
                : "bg-white text-slate-900"
            }`}
          >
            <span className="mr-4">Bid</span>
            {node.bid ? fromLovelaceDisplay(node.bid, { compact: true }) : "-"}
          </div>
        </div>
      )}
    </Link>
  );
};
