import * as React from "react";
import { Link } from "gatsby";
import { Image, Spinner } from "..";
import { useIsIntersecting } from "../../hooks";
import { fromLovelaceDisplay, ipfsToHttps } from "../../utils";

export type NodeContent = {
  budId: number;
  image: string;
  traits?: string[];
  type?: string;
  buy?: BigInt;
  bid?: BigInt;
  mint?: number;
};

type CardProps = {
  node: NodeContent;
  highlightBuy?: boolean;
  highligtBid?: boolean;
};

export const Card = ({ node, highlightBuy, highligtBid }: CardProps) => {
  const ref = React.useRef();
  const isIntersecting = useIsIntersecting(ref, "700px");
  const [imageUpdate, setImageUpdate] = React.useState(true);
  const budId = React.useRef(node.budId);
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
      className="w-full pt-[135%] border-2 border-slate-900 border-b-4 rounded-xl relative bg-slate-800"
    >
      {isIntersecting && (
        <div className="w-full absolute top-0 left-0 flex flex-col justify-center items-center">
          <div className="w-full pb-[100%] relative">
            <div className="w-full h-full absolute top-0 left-0 flex justify-center items-center">
              <Spinner className="w-4 md:w-6 opacity-90" />
            </div>
            {imageUpdate && (
              <div className="absolute left-0 top-0 w-full h-full hover:scale-105 duration-200 will-change-transform">
                <Image threshold={700} src={ipfsToHttps(node.image)} />
              </div>
            )}
          </div>
          <div className="-mt-8 md:-mt-10 pl-3 md:pl-4 lg:pl-8 text-white font-title font-bold text-sm  md:text-lg w-full z-[1]">
            #{node.budId}
          </div>
          <div
            className={`w-4/5 mt-2  md:mt-4  border-2  border-b-4 px-2 py-1 rounded-xl text-white font-bold text-xs md:text-sm lg:text-base ${
              node.buy && highlightBuy
                ? "bg-primary border-violet-600"
                : "bg-slate-800 border-slate-900"
            }`}
          >
            <span className="mr-4">Buy</span>
            {node.buy ? fromLovelaceDisplay(node.buy, { compact: true }) : "-"}
          </div>
          <div
            className={`w-4/5 mt-1 md:mt-2 bg-slate-800 border-2 border-slate-900 border-b-4 px-2 py-1 rounded-xl text-white font-bold text-xs md:text-sm lg:text-base ${
              node.bid && highligtBid
                ? "bg-orange-500 border-orange-600"
                : "bg-slate-800 border-slate-900"
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
