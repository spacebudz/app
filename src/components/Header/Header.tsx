import * as React from "react";
import { Link } from "gatsby";
import { Button, Ellipsis, Popover } from "..";
import { Rocket } from "@styled-icons/boxicons-solid/Rocket";
import { MoreHorizontalOutline } from "@styled-icons/evaicons-outline/MoreHorizontalOutline";
import { People } from "@styled-icons/fluentui-system-filled/People";
import { CloseCircle } from "@styled-icons/evaicons-solid/CloseCircle";
import { WalletDialog } from ".";
import { useStoreActions, useStoreState } from "easy-peasy";
import { getAddressBech32, getCardano, getSelectedWallet } from "../../utils";
import { setSelectedWallet } from "./wallet";
import {
  DISCORD_LINK,
  GITHUB_LINK,
  TELEGRAM_LINK,
  TWITTER_LINK,
} from "../../config";

import Logo from "../../images/brand/logo.svg";

type HeaderProps = {
  landing?: boolean;
};

export const Header = (props: HeaderProps) => {
  const dialogRef = React.useRef<any>();
  const [wallet, setWallet, resetWallet] = [
    useStoreState<any>((state) => state.wallet.wallet),
    useStoreActions<any>((actions) => actions.wallet.setWallet),
    useStoreActions<any>((actions) => actions.wallet.resetWallet),
  ];
  const cardano = getCardano();

  const reset = () => {
    delete cardano.selectedWallet;
    resetWallet();
  };

  const init = async () => {
    if (!cardano) return;
    if (!wallet.address) return;
    const selected = await setSelectedWallet(wallet.walletName);
    if (!selected) {
      reset();
      return;
    }
    if (wallet.walletName === "nami") {
      const selectedWallet = await getSelectedWallet();
      const walletAddress = getAddressBech32(
        (await selectedWallet.getUsedAddresses())[0]
      );
      if (wallet.address !== walletAddress) {
        reset();
        return;
      }
      selectedWallet.experimental.on("accountChange", async () => {
        const address = getAddressBech32(
          (await selectedWallet.getUsedAddresses())[0]
        );
        setWallet({ ...wallet, address, sessionTime: Date.now() });
      });
    }
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <div className="absolute z-10 top-0 left-0 w-full h-24 md:h-32 flex items-center">
      <Link to="/">
        <img
          className="ml-4 md:ml-10 lg:ml-20 w-14"
          draggable={false}
          src={Logo}
          alt="Logo"
        />
      </Link>
      <div className="ml-auto flex items-center justify-between w-[16rem] md:w-[34rem]">
        <Popover
          position="center"
          trigger={
            <div className="font-semibold flex justify-center items-center hover:brightness-75 duration-200 cursor-default">
              <Rocket
                className={`${
                  (!props.landing && "text-slate-900") || ""
                } w-[1.4rem] md:w-[1.2em]`}
              />
              <div className="ml-2 hidden md:block">Explore</div>
            </div>
          }
        >
          <Link to="/explore/">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-primary">
                  SpaceBudz
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                Explore the collection of 10,000 unique animals and creatures
              </span>
            </div>
          </Link>
        </Popover>
        <Popover
          position="center"
          trigger={
            <div className="font-semibold flex justify-center items-center hover:brightness-75 duration-200 cursor-default">
              <People
                className={`${
                  (!props.landing && "text-slate-900") || ""
                } w-[1.4rem] md:w-[1.2em]`}
              />
              <div className="ml-2 hidden md:block">Community</div>
            </div>
          }
        >
          <a href={GITHUB_LINK} target="_blank">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-[#171515]">
                  GitHub
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                If you are interested in developing check out our GitHub
                repositories
              </span>
            </div>
          </a>
          <a href={DISCORD_LINK} target="_blank">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-[#7289DA]">
                  Discord
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                Join our vibrant community on Discord with over 30K members
              </span>
            </div>
          </a>
          <a href={TWITTER_LINK} target="_blank">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-[#1DA1F2]">
                  Twitter
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                Follow us on Twitter to see the latest news
              </span>
            </div>
          </a>
          <a href={TELEGRAM_LINK} target="_blank">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-[#229ED9]">
                  Telegram
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                Get to know our smaller and helpful community on Telegram
              </span>
            </div>
          </a>
          {/* Community tools disabled for now until links and images updated */}
          {/* <Link to="/communityTools/">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-primary">
                  Community tools
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                Explore helpful and useful tools created by the community
              </span>
            </div>
          </Link> */}
        </Popover>
        <Popover
          position="center"
          trigger={
            <div className="font-semibold flex justify-center items-center hover:brightness-75 duration-200 cursor-default">
              <MoreHorizontalOutline
                className={`${
                  (!props.landing && "text-slate-900") || ""
                } w-[1.4rem] md:w-[1.2em]`}
              />
              <div className="ml-2 hidden md:block">More</div>
            </div>
          }
        >
          <Link to="/FAQ/">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-black">Help</span>
              </span>
              <span className="block text-sm text-gray-500">
                Read through our FAQ
              </span>
            </div>
          </Link>
          <Link to="/termsAndConditions/">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-black">
                  NFT license
                </span>
              </span>
              <span className="block text-sm text-gray-500">
                Our terms and conditions
              </span>
            </div>
          </Link>
          <Link to="/about/">
            <div className="px-4 py-2 transition duration-200 ease-in-out rounded-lg hover:bg-slate-100">
              <span className="flex items-center">
                <span className="text-md font-medium text-black">About</span>
              </span>
            </div>
          </Link>
        </Popover>
        <div className="mr-4 md:mr-10 lg:mr-20 w-28 flex justify-end items-center">
          {wallet.address ? (
            <div className="text-white p-2 rounded-xl bg-primary border-2 border-b-4 border-violet-600 flex justify-center items-center">
              <Link
                to={`/profile/?address=${wallet.address}`}
                className="text-left"
              >
                <Ellipsis className="text-xs w-[5.5rem] md:w-[6.5rem] font-bold -mr-8">
                  {wallet.address}
                </Ellipsis>
              </Link>
              <button
                className="w-[1.3rem] flex justify-center"
                onClick={reset}
              >
                <CloseCircle />
              </button>
            </div>
          ) : (
            <Button
              onClick={() => {
                dialogRef.current.open();
              }}
            >
              Start
            </Button>
          )}
        </div>
      </div>
      <WalletDialog ref={dialogRef} />
    </div>
  );
};
