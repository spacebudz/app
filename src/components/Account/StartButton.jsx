import React from "react";
import Background from "../../images/assets/startButton.svg";
import * as style from "./StartButton.module.css";

import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { navigate } from "gatsby-link";
import Loader from "../../cardano/loader";

// Asset
import { useStoreActions, useStoreState } from "easy-peasy";
import { Button, Box, useToast } from "@chakra-ui/react";
import { Image } from "@chakra-ui/image";
import MiddleEllipsis from "react-middle-ellipsis";
import { ChevronRightIcon, InfoIcon } from "@chakra-ui/icons";

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
  const toast = useToast();

  React.useEffect(() => {
    if (connected && !flag)
      window.cardano.onAccountChange(async () => {
        const address = await addressToBech32();
        setConnected(address);
        setFlag(true);
      });
  }, [connected]);

  const checkConnection = async () => {
    if (window.cardano && (await window.cardano.isEnabled())) {
      const session = localStorage.getItem("session");
      if (Date.now() - parseInt(session) < 6000000) {
        //1h
        const address = await addressToBech32();
        setConnected(address);
      }
    }
  };

  React.useEffect(() => {
    checkConnection();
  }, []);

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
      <Ellipsis connected={connected} />
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
        if (!(await checkStatus(toast, connected))) {
          setIsLoading(false);
          return;
        }
        if (await window.cardano.enable().catch((e) => {})) {
          const address = await addressToBech32();
          setConnected(address);
          localStorage.setItem("session", Date.now().toString());
        }

        setIsLoading(false);
      }}
    >
      <Image src={Background} width="full" height="full" position="absolute" />
      <Box zIndex="1">Connect</Box>
    </Button>
  );
};

const Ellipsis = ({ connected }) => {
  const [change, setChange] = React.useState(false);

  React.useEffect(() => {
    setChange(true);
    setTimeout(() => setChange(false));
  }, [connected]);

  return (
    !change && (
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
    )
  );
};

export default StartButton;

const checkStatus = async (toast, connected) => {
  return (
    NoNami(toast) &&
    (await window.cardano.enable().catch((e) => {})) &&
    (await WrongNetworkToast(toast))
  );
};

const NoNami = (toast) => {
  if (window.cardano) return true;
  toast({
    position: "bottom-right",
    render: () => (
      <Box
        background="purple.400"
        color="white"
        px={6}
        py={3}
        rounded="3xl"
        display="flex"
        alignItems="center"
      >
        <InfoIcon />
        <Box ml="3" fontWeight="medium">
          Nami not installed
        </Box>
        <Button
          rounded="3xl"
          colorScheme="whiteAlpha"
          onClick={() => window.open("https://namiwallet.io")}
          ml="4"
          size="xs"
          rightIcon={<ChevronRightIcon />}
        >
          Get it
        </Button>
      </Box>
    ),
    duration: 9000,
  });
  return false;
};

const WrongNetworkToast = async (toast) => {
  if ((await window.cardano.getNetworkId()) === 1) return true;
  toast({
    position: "bottom-right",
    duration: 5000,
    render: () => (
      <Box
        background="purple.400"
        color="white"
        px={6}
        py={3}
        rounded="3xl"
        display="flex"
        alignItems="center"
      >
        <InfoIcon />
        <Box ml="3" fontWeight="medium">
          Wrong network
        </Box>
      </Box>
    ),
  });
  return false;
};
