import { Link } from "gatsby";
import * as React from "react";
import { DISCORD_LINK, TELEGRAM_LINK, TWITTER_LINK } from "../../config";

import Logo from "../../images/brand/logo.svg";

export const Footer = () => {
  return (
    <div className=" bg-slate-800 w-full flex flex-col-reverse md:flex-row px-12 py-10 text-white">
      <div className="flex flex-col justify-center items-center md:items-start flex-grow-0">
        <div className="flex justify-center items-center mb-4">
          <img draggable={false} src={Logo} className="w-14" alt="Logo" />
          <div className="font-title font-bold text-xl ml-4">SpaceBudz</div>
        </div>
        <Link
          className="text-sm font-light mb-1 text-primary"
          to="/termsAndConditions/"
        >
          Terms and Conditions
        </Link>
        <div className="text-sm font-light text-slate-500">
          info@spacebudz.io
        </div>
      </div>
      <div className="w-full flex justify-center flex-grow-0 mb-16 md:mb-0">
        <div className="h-full flex flex-col justify-start text-sm text-slate-200 font-medium">
          <Link className="hover:opacity-80 duration-200" to="/explore/">
            Explore
          </Link>
          <Link className="hover:opacity-80 duration-200" to="/about/">
            About
          </Link>
          <Link className="hover:opacity-80 duration-200" to="/FAQ/">
            Help
          </Link>
          <a
            className="hover:opacity-80 duration-200"
            href="https://v1.spacebudz.io"
            target="_blank"
          >
            Marketplace v1
          </a>
          <Link className="hover:opacity-80 duration-200" to="/privacyPolicy/">
            Privacy policy
          </Link>
        </div>
        <div className="w-20 md:w-28" />
        <div className="h-full flex flex-col justify-start text-sm text-slate-300 font-medium">
          <a
            className="text-[#1DA1F2] hover:opacity-80 duration-200"
            target="_blank"
            href={TWITTER_LINK}
          >
            Twitter
          </a>
          <a
            className="text-[#7289DA] hover:opacity-80 duration-200"
            target="_blank"
            href={DISCORD_LINK}
          >
            Discord
          </a>
          <a
            className="text-[#229ED9] hover:opacity-80 duration-200"
            target="_blank"
            href={TELEGRAM_LINK}
          >
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
};
