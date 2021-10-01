import React from "react";
import Background from "../../images/assets/startButton.svg";
import * as style from "./StartButton.module.css";
import { useToasts } from "@geist-ui/react";

import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { navigate } from "gatsby-link";
import Loader from "../../cardano/loader";

// Asset
import { useStoreActions, useStoreState } from "easy-peasy";
import { Button, Box } from "@chakra-ui/react";
import { Image } from "@chakra-ui/image";
import MiddleEllipsis from "react-middle-ellipsis";

const addressToBech32 = async () => {
  await Loader.load();
  const address = (await window.cardano.getUsedAddresses())[0];
  return Loader.Cardano.Address.from_bytes(
    Buffer.from(address, "hex")
  ).to_bech32();
};
const StartButton = (props) => {
  const matches = useBreakpoint();
  const [isLoading, setIsLoading] = React.useState(false);
  const [flag, setFlag] = React.useState(false);
  const connected = useStoreState((state) => state.connection.connected);
  const setConnected = useStoreActions(
    (actions) => actions.connection.setConnected
  );
  const [, setToast] = useToasts();

  React.useEffect(() => {
    if (connected && !flag)
      window.cardano.onAccountChange(async () => {
        const address = await addressToBech32();
        console.log(address);
        setConnected(address);
        setFlag(true);
      });
  }, [connected]);

  return connected ? (
    <div
      className={style.accountButton}
      style={{
        width: 100,
        zoom: matches.md && "0.85",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      onClick={() => navigate(`/profile?address=${connected}`)}
    >
      <div
        style={{
          width: "130px",
          whiteSpace: "nowrap",
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        <MiddleEllipsis>
          <span>{connected}</span>
        </MiddleEllipsis>
      </div>
    </div>
  ) : (
    <Button
      isDisabled={isLoading}
      isLoading={isLoading}
      colorScheme="purple"
      rounded="3xl"
      position="relative"
      overflow="hidden"
      py="0.5"
      size={matches.md ? "sm" : "md"}
      onClick={async () => {
        setIsLoading(true);
        if (!window.cardano) {
          setToast({
            delay: 5000,
            text: (
              <span style={{ fontWeight: "bolder" }}>
                Get Nami Wallet first
              </span>
            ),
            actions: [
              {
                name: "Get",
                handler: () => window.open("https://namiwallet.io"),
              },
            ],
          });
          setIsLoading(false);
          return;
        }
        await window.cardano.enable();
        if ((await window.cardano.getNetworkId()) !== 0) {
          //TODO change to mainnet!
          setToast({
            delay: 5000,
            text: (
              <span style={{ fontWeight: "bolder" }}>
                Wrong network, please switch to mainnet
              </span>
            ),
          });
          setIsLoading(false);
          return;
        }
        const address = await addressToBech32();
        setConnected(address);
        setIsLoading(false);
      }}
    >
      <Image
        src={Background}
        width="full"
        height="full"
        position="absolute"
        right={-2}
        top={-1}
      />
      <Box zIndex="1">Connect</Box>
    </Button>
  );
};

export default StartButton;
