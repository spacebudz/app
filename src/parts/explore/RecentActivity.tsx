import * as React from "react";
import { Image } from "../../components";
import throttle from "lodash.throttle";
import { fromLovelaceDisplay, ipfsToHttps } from "../../utils";
import { Link } from "gatsby";
import { ArrowRightShort } from "@styled-icons/bootstrap/ArrowRightShort";

export type ActivityType =
  | "sold"
  | "bought"
  | "listed"
  | "bid"
  | "canceledBid"
  | "canceledListing";

export type Activity = {
  type: ActivityType;
  lovelace: BigInt;
  budId: number;
  slot: number;
  image: string;
  needsToMigrate?: boolean;
};

type RecentActivityProps = {
  array: Activity[];
};

export const RecentActivity = ({ array }: RecentActivityProps) => {
  const [scrollPosition, setScrollPosition] = React.useState({ x: 0, y: 0 });
  const elRef = React.useRef(null);
  React.useEffect(() => {
    const activity = document.getElementById("activity");
    const getScrollX = () => activity.scrollLeft;
    const getScrollY = () => window.scrollY || window.pageYOffset;
    const changeScroll = () =>
      setScrollPosition({ x: getScrollX(), y: getScrollY() });
    const onChangeScroll = throttle(changeScroll, 300);
    activity.addEventListener("scroll", onChangeScroll);
    activity.addEventListener("resize", onChangeScroll);
    window.addEventListener("scroll", onChangeScroll);
    window.addEventListener("resize", onChangeScroll);
    return () => {
      activity.removeEventListener("scroll", onChangeScroll);
      activity.removeEventListener("resize", onChangeScroll);
      window.removeEventListener("scroll", onChangeScroll);
      window.removeEventListener("resize", onChangeScroll);
    };
  }, []);
  return (
    <div className="h-48 w-full bg-slate-900 border-2 border-b-4 border-slate-900 rounded-xl text-white overflow-hidden relative">
      <div
        id="activity"
        className="h-full flex items-center overflow-x-scroll scroll-smooth overflow-y-hidden space-x-1 justify-start scrollbar-none"
      >
        {array &&
          array.map((activity, key) => (
            <div
              key={key}
              ref={key === 0 ? elRef : null}
              className="w-full md:w-1/2 lg:w-1/3 lg:min-w-[350px] max-w-[450px] h-full flex-shrink-0 flex justify-center items-center"
            >
              <div className="w-full h-full overflow-hidden flex justify-center items-center bg-slate-700 relative">
                <Link to={`/spacebud/${activity.budId}/`}>
                  <div>
                    <Image
                      className={`mt-24 ${
                        activity.needsToMigrate
                          ? "brightness-[16%] blur-md"
                          : ""
                      }`}
                      scrollPosition={scrollPosition}
                      threshold={700}
                      width={700}
                      src={ipfsToHttps(activity.image)}
                    />
                  </div>
                  <div className="absolute left-0 top-0 font-title font-bold bg-slate-800 rounded-br-xl text-white w-16 py-1 text-center">
                    #{activity.budId}
                  </div>
                  {renderSwitch(activity)}
                </Link>
              </div>
            </div>
          ))}
      </div>
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-pointer w-8 h-8 flex justify-center items-center rounded-full bg-slate-500"
        onClick={() => {
          const activity = document.getElementById("activity");
          activity.scrollTo(
            activity.scrollLeft - elRef.current.offsetWidth - 4,
            0
          );
        }}
      >
        <ArrowRightShort
          size={26}
          className="stroke-white stroke-1 rotate-180"
        />
      </div>
      <div
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer w-8 h-8 flex justify-center items-center rounded-full bg-slate-500"
        onClick={() => {
          const activity = document.getElementById("activity");
          activity.scrollTo(
            activity.scrollLeft + elRef.current.offsetWidth + 4,
            0
          );
        }}
      >
        <ArrowRightShort size={26} className="stroke-white stroke-1" />
      </div>
    </div>
  );
};

const renderSwitch = (activity: Activity) => {
  switch (activity.type) {
    case "bid":
      return (
        <div className="absolute right-2 bottom-2 font-bold bg-white rounded-xl text-black px-2 py-1 text-center">
          <span className="font-semibold">Bid</span>{" "}
          <span className="font-bold text-orange-500">
            {fromLovelaceDisplay(activity.lovelace, { compact: true })}
          </span>
        </div>
      );
    case "bought":
      return (
        <div className="absolute right-2 bottom-2 font-bold bg-white rounded-xl text-black px-2 py-1 text-center">
          <span className="font-semibold">Bought</span>{" "}
          <span className="font-bold text-primary">
            {fromLovelaceDisplay(activity.lovelace, { compact: true })}
          </span>
        </div>
      );
    case "canceledBid":
      return (
        <div className="absolute right-2 bottom-2 font-bold bg-white rounded-xl text-black px-2 py-1 text-center">
          <span className="font-semibold">Canceled bid</span>{" "}
          <span className="font-bold text-orange-500">
            {fromLovelaceDisplay(activity.lovelace, { compact: true })}
          </span>
        </div>
      );
    case "canceledListing":
      return (
        <div className="absolute right-2 bottom-2 font-bold bg-white rounded-xl text-black px-2 py-1 text-center">
          <span className="font-semibold">Canceled listing</span>{" "}
          <span className="font-bold text-primary">
            {fromLovelaceDisplay(activity.lovelace, { compact: true })}
          </span>
        </div>
      );
    case "listed":
      return (
        <div className="absolute right-2 bottom-2 font-bold bg-white rounded-xl text-black px-2 py-1 text-center">
          <span className="font-semibold">Listed</span>{" "}
          <span className="font-bold text-primary">
            {fromLovelaceDisplay(activity.lovelace, { compact: true })}
          </span>
        </div>
      );
    case "sold":
      return (
        <div className="absolute right-2 bottom-2 font-bold bg-white rounded-xl text-black px-2 py-1 text-center">
          <span className="font-semibold">Sold</span>{" "}
          <span className="font-bold text-orange-500">
            {fromLovelaceDisplay(activity.lovelace, { compact: true })}
          </span>
        </div>
      );
  }
};
