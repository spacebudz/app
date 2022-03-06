import { useStoreActions } from "easy-peasy";
import * as React from "react";
import { Button } from "..";
import { getCardano } from "../../utils";
import { Dialog } from "../Dialog";
import { setSelectedWallet } from "./wallet";

export const WalletDialog = React.forwardRef((props: any, ref: any) => {
  const cardano = getCardano();
  const existingWallets = cardano
    ? Object.keys(cardano).filter(
        (walletName) =>
          walletName === "nami" ||
          walletName === "ccvault" ||
          walletName === "flint"
      )
    : [];
  const setWallet = useStoreActions<any>((actions) => actions.wallet.setWallet);
  return (
    <Dialog ref={ref}>
      <div className="w-full flex flex-col items-center">
        <div className="w-full text-2xl font-semibold mb-4">Select wallet</div>
        <div className="w-full self-start mb-10 font-light">
          Select a wallet to view your collection and interact with the
          marketplace, where you can buy, sell and bid on SpaceBudz.
        </div>
        {existingWallets.length > 0 ? (
          existingWallets.map((walletName, index) => (
            <WalletSelection
              key={index}
              walletName={walletName}
              setWallet={setWallet}
              cardano={cardano}
              ref={ref}
            />
          ))
        ) : (
          <div className="text-center">
            <div>No wallet found :(</div>
            <div className="mt-2 font-bold">
              Get started with{" "}
              <a
                className="text-primary font-bold cursor-pointer hover:opacity-90"
                href="https://namiwallet.io"
                target="_blank"
              >
                Nami
              </a>
            </div>
          </div>
        )}
        <Button
          theme="space"
          className="w-28 mt-6 self-end"
          onClick={() => ref.current.close()}
        >
          Close
        </Button>
      </div>
    </Dialog>
  );
});

const WalletSelection = React.forwardRef(
  ({ walletName, setWallet, cardano }: any, ref: any) => {
    const [loading, setLoading] = React.useState(false);
    return (
      <Button
        loading={loading}
        className="w-3/4 mb-4"
        onClick={async () => {
          setLoading(true);
          const address = await setSelectedWallet(walletName);
          if (address) {
            setWallet({
              walletName,
              sessionTime: Date.now(),
              address,
              icon: cardano[walletName].icon,
            });
            ref.current.close();
          }
          setLoading(false);
        }}
      >
        {cardano[walletName].name}
      </Button>
    );
  }
);
