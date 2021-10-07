import React from "react";
import InfiniteGrid from "../components/InfiniteGrid";
import Metadata from "../components/Metadata";
import { useStoreState } from "easy-peasy";
import { FloatingButton } from "../components/Button";
import { Box } from "@chakra-ui/layout";
import { BeatLoader } from "react-spinners";
import Icon from "@mdi/react";
import { mdiOpenInNew } from "@mdi/js";
import secrets from "../../secrets";

const POLICY = "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc";

function fromHex(hex) {
  var str = "";
  for (var i = 0; i < hex.length && hex.substr(i, 2) !== "00"; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

const Profile = ({ pageContext: { spacebudz } }) => {
  const [address, setAddress] = React.useState("");
  const [tokens, setTokens] = React.useState(null);
  const connected = useStoreState((state) => state.connection.connected);
  const didMount = React.useRef(false);
  const isFirstConnect = React.useRef(true);
  const fetchAddressBudz = async (address) => {
    setTokens(null);
    const amount = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`,
      { headers: { project_id: secrets.PROJECT_ID } }
    )
      .then((res) => res.json())
      .then((res) => res.amount);
    try {
      const budzAmount = amount
        .filter((am) => am.unit.startsWith(POLICY))
        .map((am) => parseInt(fromHex(am.unit.slice(56)).split("SpaceBud")[1]));
      const tokens = budzAmount.map((id) => spacebudz[id]);
      setTokens(tokens);
    } catch (e) {
      setTokens([]);
    }
  };
  const update = async () => {
    const address =
      typeof window !== "undefined" &&
      new URL(window.location.href).searchParams.get("address");
    setAddress(address);
    fetchAddressBudz(address);
  };
  React.useEffect(() => {
    if (didMount.current) {
      if (connected && !isFirstConnect.current)
        window.history.pushState({}, null, `/profile?address=${connected}`);
      else isFirstConnect.current = false;
    } else didMount.current = true;
    window.scrollTo(0, 0);
    update();
  }, [connected]);
  React.useEffect(() => {
    let url = window.location.href;
    const urlChange = setInterval(() => {
      const newUrl = window.location.href;
      if (url !== newUrl) {
        url = newUrl;
        update();
      }
    });
    return () => clearInterval(urlChange);
  }, []);

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz | Profile"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <div
        style={{
          minHeight: "100vh",
          margin: "0 20px",
          marginTop: 20,
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          marginTop: 150,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            width: "100%",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 26 }}>
            Account Details {address === connected && "(Connected)"}
          </div>
          {/* <Spacer y={0.5} /> */}
          <Box h={4} />
          <div style={{ display: "flex" }}>
            <div
              style={{
                wordBreak: "break-all",
                verticalAlign: "middle",
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(`https://cardanoscan.io/address/${address}`)
              }
            >
              <span style={{ fontSize: 12, marginRight: 6 }}>{address}</span>
              <Icon path={mdiOpenInNew} size={0.6} />
              {/* <ExternalLink size={12} /> */}
            </div>
          </div>
          {/* <Spacer y={2} /> */}
          <Box h={10} />
          <div style={{ width: "100%", display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                width: 180,
                height: 80,
                backgroundColor: "#4a148c",
                borderRadius: 15,
                color: "white",
              }}
            >
              <div
                style={{
                  marginTop: 10,
                  marginBottom: 4,
                }}
              >
                Total Owned
              </div>
              <div style={{ fontWeight: "bold", fontSize: 18 }}>
                {tokens ? tokens.length : "..."}
              </div>
            </div>
          </div>
          {/* <Spacer y={3} /> */}
          <Box h={14} />
          <div style={{ marginBottom: 100 }}>
            {!tokens ? (
              <Box
                w="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <BeatLoader size="5" color="#6B46C1" />
              </Box>
            ) : (
              <InfiniteGrid array={tokens} spacebudz={spacebudz} />
            )}
          </div>
        </div>
      </div>
      <FloatingButton onClick={() => window.scrollTo(0, 0)} />
    </>
  );
};

export default Profile;
