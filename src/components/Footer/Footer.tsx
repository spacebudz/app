import { Link } from "gatsby";
import * as React from "react";
import {
  DISCORD_LINK,
  TELEGRAM_LINK,
  TWITTER_LINK,
  GITHUB_LINK,
} from "../../config";

import Logo from "../../images/brand/logo.svg";

export const Footer = () => {
  const [isDark, setIsDark] = React.useState(true);

  React.useEffect(() => {
    setIsDark(
      window.location.pathname === "/" ||
        window.location.pathname === "/404" ||
        window.location.pathname === "/wormhole"
    );
  }, [window.location]);

  return (
    <div
      className={`w-full flex flex-col-reverse md:flex-row px-20 py-16 absolute ${
        isDark ? "bg-slate-900" : "bg-white"
      }`}
    >
      <div
        className={`absolute top-0 w-[90%] h-[1px] rounded-xl mx-auto left-0 right-0 ${
          isDark ? "bg-primary" : "bg-slate-300"
        }`}
      />
      <div className="flex flex-col justify-center items-center md:items-start flex-grow-0">
        <div className="flex justify-center items-center mb-4">
          <img draggable={false} src={Logo} className="w-14" alt="Logo" />
          <div
            className={`font-title font-bold text-xl ml-4 ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            SpaceBudz
          </div>
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
        <div
          className={`h-full flex flex-col justify-start text-sm font-medium ${
            isDark ? "text-slate-200" : "text-slate-800"
          }`}
        >
          <Link className="hover:opacity-80 duration-200" to="/explore/">
            Explore
          </Link>
          <Link className="hover:opacity-80 duration-200" to="/about/">
            About
          </Link>
          <Link className="hover:opacity-80 duration-200" to="/FAQ/">
            Help
          </Link>
          <Link className="hover:opacity-80 duration-200" to="/privacyPolicy/">
            Privacy policy
          </Link>
        </div>
        <div className="w-20 md:w-28" />
        <div
          className={`h-full flex flex-col justify-start text-sm font-medium ${
            isDark ? "text-slate-200" : "text-slate-800"
          }`}
        >
          <a
            className="hover:opacity-80 duration-200"
            target="_blank"
            href={GITHUB_LINK}
          >
            GitHub
          </a>
          <a
            className="hover:opacity-80 duration-200"
            target="_blank"
            href={TWITTER_LINK}
          >
            Twitter
          </a>
          <a
            className="hover:opacity-80 duration-200"
            target="_blank"
            href={DISCORD_LINK}
          >
            Discord
          </a>
          <a
            className="hover:opacity-80 duration-200"
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
