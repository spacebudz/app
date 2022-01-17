import React from "react";
import InfiniteGrid from "../components/InfiniteGrid";
import Metadata from "../components/Metadata";
import { useStoreState } from "easy-peasy";
import { FloatingButton } from "../components/Button";
import { Box, SimpleGrid } from "@chakra-ui/layout";
import { BeatLoader } from "react-spinners";
import Icon from "@mdi/react";
import { mdiOpenInNew } from "@mdi/js";
import secrets from "../../secrets";
import { Spinner } from "@chakra-ui/spinner";
import Loader from "../cardano/loader";

const POLICY = "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc";

function fromHex(hex) {
  var str = "";
  for (var i = 0; i < hex.length && hex.substr(i, 2) !== "00"; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

const valueToAssets = (value) => {
  const assets = [];
  assets.push({ unit: "lovelace", quantity: value.coin().to_str() });
  if (value.multiasset()) {
    const multiAssets = value.multiasset().keys();
    for (let j = 0; j < multiAssets.len(); j++) {
      const policy = multiAssets.get(j);
      const policyAssets = value.multiasset().get(policy);
      const assetNames = policyAssets.keys();
      for (let k = 0; k < assetNames.len(); k++) {
        const policyAsset = assetNames.get(k);
        const quantity = policyAssets.get(policyAsset);
        const asset =
          Buffer.from(policy.to_bytes(), "hex").toString("hex") +
          Buffer.from(policyAsset.name(), "hex").toString("hex");
        assets.push({
          unit: asset,
          quantity: quantity.to_str(),
        });
      }
    }
  }
  return assets;
};

const Profile = ({ pageContext: { spacebudz } }) => {
  const [address, setAddress] = React.useState("");
  const [tokens, setTokens] = React.useState({
    owned: [],
    bids: [],
    offers: [],
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const connected = useStoreState((state) => state.connection.connected);
  const didMount = React.useRef(false);
  const isFirstConnect = React.useRef(true);
  const fetchAddressBudz = async (address) => {
    setIsLoading(true);
    setTokens(null);
    const tokens = { owned: [], bids: [], offers: [] };
    let amount;
    if (connected === address) {
      await Loader.load();
      const value = Loader.Cardano.Value.from_bytes(
        Buffer.from(await window.cardano.selectedWallet.getBalance(), "hex")
      );

      amount = valueToAssets(value);
    } else {
      amount = await fetch(
        `https://cardano-mainnet.blockfrost.io/api/v0/addresses/${address}`,
        { headers: { project_id: secrets.PROJECT_ID } }
      )
        .then((res) => res.json())
        .then((res) => res.amount);
    }

    const offers = await fetch(`https://spacebudz.io/api/offers/`, {
      headers: { project_id: secrets.PROJECT_ID },
    }).then((res) => res.json());

    const bids = await fetch(`https://spacebudz.io/api/bids`, {
      headers: { project_id: secrets.PROJECT_ID },
    }).then((res) => res.json());

    tokens.offers = offers.offers
      .filter((offer) => offer.offer.owner == address)
      .map((offer) => {
        const bidPrice = bids.bids.find((bid) => bid.budId == offer.budId);
        return {
          ...spacebudz[offer.budId],
          listingPrice: offer.offer.amount,
          bidPrice: bidPrice ? bidPrice.bid.amount : undefined,
        };
      });

    tokens.bids = bids.bids
      .filter((bid) => bid.bid.owner == address)
      .map((bid) => {
        const listingPrice = offers.offers.find(
          (offer) => offer.budId == bid.budId
        );
        return {
          ...spacebudz[bid.budId],
          bidPrice: bid.bid.amount,
          listingPrice: listingPrice ? listingPrice.offer.amount : undefined,
        };
      });

    console.log(tokens.bids);

    try {
      const ownedAmount = amount
        .filter((am) => am.unit.startsWith(POLICY))
        .map((am) => parseInt(fromHex(am.unit.slice(56)).split("SpaceBud")[1]));
      const ownedBids = bids.bids.filter((bid) => bid.bid.owner == address);
      const owned = ownedAmount.map((id) => {
        const bidPrice = bids.bids.find((bid) => bid.budId == id);
        return {
          ...spacebudz[id],
          bidPrice: bidPrice ? bidPrice.bid.amount : undefined,
        };
      });
      tokens.owned = owned;
    } catch (e) {}
    setTokens(tokens);
    setIsLoading(false);
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
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SimpleGrid
              width="90%"
              maxWidth={800}
              columns={[1, null, 3]}
              gap={8}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
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
                  {!isLoading
                    ? tokens.owned.length + tokens.offers.length
                    : "..."}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
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
                  Open Bids
                </div>
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  {!isLoading ? tokens.bids.length : "..."}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
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
                  Listed
                </div>
                <div style={{ fontWeight: "bold", fontSize: 18 }}>
                  {!isLoading ? tokens.offers.length : "..."}
                </div>
              </div>
            </SimpleGrid>
          </div>
          {/* <Spacer y={3} /> */}
          <Box h={10} />
          <div style={{ marginBottom: 100 }}>
            {isLoading ? (
              <Box
                width="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner mt="10" size="sm" color="purple" />
              </Box>
            ) : (
              <Box
                width="full"
                display="flex"
                alignItems="center"
                flexDirection="column"
              >
                <Box h="1px" w="95%" background="gray.200" my={10} />

                <Box width="full" fontWeight="bold" fontSize="x-large" mb={4}>
                  Open Bids
                </Box>
                <Box width="full">
                  <InfiniteGrid
                    array={tokens.bids}
                    spacebudz={spacebudz}
                    type="Bid"
                    hasDouble
                  />
                </Box>
                <Box h="1px" w="95%" background="gray.200" my={10} />
                <Box width="full" fontWeight="bold" fontSize="x-large" mb={4}>
                  Listed
                </Box>
                <Box width="full">
                  <InfiniteGrid
                    array={tokens.offers}
                    spacebudz={spacebudz}
                    type="Listed"
                    hasDouble
                  />
                </Box>
                <Box h="1px" w="95%" background="gray.200" my={10} />
                <Box width="full" fontWeight="bold" fontSize="x-large" mb={4}>
                  Owned
                </Box>
                <Box width="full">
                  <InfiniteGrid
                    array={tokens.owned}
                    spacebudz={spacebudz}
                    type="Bid"
                    hasDouble
                  />
                </Box>
              </Box>
            )}
          </div>
        </div>
      </div>
      <FloatingButton onClick={() => window.scrollTo(0, 0)} />
    </>
  );
};

export default Profile;
