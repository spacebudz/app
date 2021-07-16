import { Loading, Spacer } from "@geist-ui/react";
import React from "react";
import InfiniteGrid from "../components/InfiniteGrid";
import Metadata from "../components/Metadata";
import { ExternalLink } from "@geist-ui/react-icons";
import Loader from "../cardano/loader";
import buffer from "buffer";
import { useStoreState } from "easy-peasy";
import { FloatingButton } from "../components/Button";
const Buffer = buffer.Buffer;

const POLICY = "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc";

function fromHex(hex) {
  var str = "";
  for (var i = 0; i < hex.length && hex.substr(i, 2) !== "00"; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

const addressToBech32 = async () => {
  await Loader.load();
  const address = (await window.cardano.getUsedAddresses())[0];
  return Loader.Cardano.Address.from_bytes(
    Buffer.from(address, "hex")
  ).to_bech32();
};

const Profile = ({ address, pageContext: { spacebudz } }) => {
  const [tokens, setTokens] = React.useState(null);
  const connected = useStoreState((state) => state.connection.connected);
  const [connectedAddress, setConnectedAddress] = React.useState(false);
  const fetchAddressBudz = async () => {
    setTokens(null);
    const amount = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`,
      { headers: { project_id: "3Ojodngr06BReeSN9lhsow0hypKf8gu5" } }
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
  const checkConnected = async () => {
    if (connected) {
      const walletAddress = await addressToBech32();
      if (walletAddress === address) setConnectedAddress(true);
      else setConnectedAddress(false);
    }
  };
  React.useEffect(() => {
    window.scrollTo(0, 0);
    checkConnected();
    fetchAddressBudz();
  }, [address, connected]);
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
            Account Details {connectedAddress && "(Connected)"}
          </div>
          <Spacer y={0.5} />
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
              <ExternalLink size={12} />
            </div>
          </div>
          <Spacer y={2} />
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
          <Spacer y={3} />
          <div style={{ marginBottom: 100 }}>
            {!tokens ? (
              <Loading size="large" type="success" />
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
