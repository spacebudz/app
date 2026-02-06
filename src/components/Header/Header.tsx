import * as React from "react";
import { Link } from "gatsby";
import { Button, Ellipsis, Popover } from "..";
import { Rocket } from "@styled-icons/boxicons-solid/Rocket";
import { CloseCircle } from "@styled-icons/evaicons-solid/CloseCircle";
import { WalletDialog } from ".";
import { useStoreActions, useStoreState } from "easy-peasy";
import { getAddressBech32, getCardano, getSelectedWallet } from "../../utils";
import { setSelectedWallet } from "./wallet";

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
    if (!selected || !localStorage["termsAccepted03162023"]) {
      reset();
      return;
    }
    if (wallet.walletName === "nami") {
      const selectedWallet = await getSelectedWallet();
      const walletAddress = getAddressBech32(
        (await selectedWallet.getUsedAddresses())[0],
      );
      if (wallet.address !== walletAddress) {
        reset();
        return;
      }
      selectedWallet.experimental.on("accountChange", async () => {
        const address = getAddressBech32(
          (await selectedWallet.getUsedAddresses())[0],
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
