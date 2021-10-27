import { useDisclosure } from "@chakra-ui/hooks";
import React from "react";
import MiddleEllipsis from "react-middle-ellipsis";
// import { Button } from "../components/Button";
import { navigate } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import Metadata from "../components/Metadata";
import styled from "styled-components";
import {
  ShareModal,
  TradeModal,
  SuccessTransactionToast,
  PendingTransactionToast,
  FailedTransactionToast,
  tradeErrorHandler,
} from "../components/Modal";
import { Share2 } from "@geist-ui/react-icons";
import { Box, Text } from "@chakra-ui/layout";
import {
  Link,
  Tooltip,
  Button,
  ButtonGroup,
  IconButton,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { SmallCloseIcon, RepeatIcon } from "@chakra-ui/icons";
import { useStoreState } from "easy-peasy";
import Market from "../cardano/market";
import secrets from "../../secrets";

//assets
import Show from "../images/assets/show.svg";
import { UnitDisplay } from "../components/UnitDisplay";

export const toHex = (bytes) => Buffer.from(bytes).toString("hex");

const isBrowser = () => typeof window !== "undefined";

const SpaceBud = ({ pageContext: { spacebud } }) => {
  const matches = useBreakpoint();
  const toast = useToast();
  const [owner, setOwner] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const tradeRef = React.useRef();
  const [isLoadingMarket, setIsLoadingMarket] = React.useState(true);
  const [details, setDetails] = React.useState({
    bid: { bidUtxo: null, lovelace: null, usd: null, owner: false },
    offer: { offerUtxo: null, lovelace: null, usd: null, owner: true },
    lastSale: { lovelace: null, usd: null },
  });
  const [loadingButton, setLoadingButton] = React.useState({
    cancelBid: false,
    bid: false,
    buy: false,
    offer: false,
    cancelOffer: false,
    sell: false,
  });
  const connected = useStoreState((state) => state.connection.connected);
  const market = React.useRef();

  const POLICY = "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc"; // mainnet
  const CONTRACT_ADDRESS =
    "addr1wyzynye0nksztrfzpsulsq7whr3vgh7uvp0gm4p0x42ckkqqq6kxq";

  React.useEffect(() => {
    loadMarket();
  }, []);
  const firstUpdate = React.useRef(true);
  React.useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    loadSpaceBudData();
  }, [connected]);

  const checkTransaction = async (txHash, { type, lovelace } = {}) => {
    if (!txHash) return;
    PendingTransactionToast(toast);
    if (type) {
      fetch("https://api.spacebudzbot.com/tweet", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + secrets.TWITTER_BOT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: spacebud.id.toString(), type, lovelace }),
      })
        .then(console.log)
        .catch(console.log);
    }
    await market.current.awaitConfirmation(txHash);
    toast.closeAll();
    SuccessTransactionToast(toast, txHash);
    await new Promise((res, rej) => setTimeout(() => res(), 1000));
    loadSpaceBudData();
  };

  const loadMarket = async () => {
    market.current = new Market(
      {
        base: "https://cardano-mainnet.blockfrost.io/api/v0",
        projectId: secrets.PROJECT_ID,
      },
      "addr1qxpxm8a0uxe6eu2m6fgdu6wqfclujtzyjdu9jw0qdxfjaz02h5ngjz7fftac5twlxj6jha4meenh6476m5xdwmeyh4hq0zeknx"
    );
    await market.current.load();
    loadSpaceBudData();
  };

  const loadSpaceBudData = async () => {
    setIsLoadingMarket(true);
    setOwner([]);
    const token = POLICY + toHex(`SpaceBud${spacebud.id}`);
    let addresses = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/assets/${token}/addresses`,
      { headers: { project_id: secrets.PROJECT_ID } }
    ).then((res) => res.json());
    const fiatPrice = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd`
    )
      .then((res) => res.json())
      .then((res) => res.cardano["usd"]);
    const lastSale = await fetch(
      `https://spacebudz.io/api/specificSpaceBud/${spacebud.id}`
    )
      .then((res) => res.json())
      .then((res) => res.lastSale);

    const bidUtxo = await market.current.getBid(spacebud.id);
    let offerUtxo = await market.current.getOffer(spacebud.id);
    // check if twin
    if (Array.isArray(offerUtxo)) {
      if (
        offerUtxo.length == 2 &&
        (spacebud.id == 1903 || spacebud.id == 6413)
      ) {
        const ownerUtxo = offerUtxo.find(
          (utxo) => utxo.tradeOwnerAddress.to_bech32() == connected
        );
        if (ownerUtxo) {
          offerUtxo = ownerUtxo;
        } else {
          const offerUtxo1 = offerUtxo[0];
          const offerUtxo2 = offerUtxo[1];
          // set correct owner
          addresses = [
            { adddress: offerUtxo1.tradeOwnerAddress.to_bech32() },
            { address: offerUtxo1.tradeOwnerAddress.to_bech32() },
          ];
          if (
            isBrowser() &&
            window.BigInt(offerUtxo1.lovelace) <
              window.BigInt(offerUtxo2.lovelace)
          ) {
            offerUtxo = offerUtxo1;
          } else {
            offerUtxo = offerUtxo2;
          }
        }
      } else throw new Error("Something went wrong");
    }
    const details = {
      bid: { bidUtxo: null, lovelace: null, usd: null, owner: false },
      offer: { offerUtxo: null, lovelace: null, usd: null, owner: false },
      lastSale: { lovelace: null, usd: null },
    };
    details.bid.bidUtxo = bidUtxo;
    details.offer.offerUtxo = offerUtxo;
    console.log(bidUtxo);
    console.log(offerUtxo);
    // ignore if state is StartBid
    if (toHex(bidUtxo.datum.to_bytes()) !== "d866820080") {
      if (bidUtxo.tradeOwnerAddress.to_bech32() === connected)
        details.bid.owner = true;
      details.bid.lovelace = bidUtxo.lovelace;
      details.bid.usd = (bidUtxo.lovelace / 10 ** 6) * fiatPrice * 10 ** 2;
    }
    if (addresses.find((address) => address.address == connected))
      details.offer.owner = true;
    if (offerUtxo) {
      addresses = addresses.map((address) =>
        address.address == CONTRACT_ADDRESS
          ? { address: offerUtxo.tradeOwnerAddress.to_bech32() }
          : address
      );
      if (offerUtxo.tradeOwnerAddress.to_bech32() === connected)
        details.offer.owner = true;
      details.offer.lovelace = offerUtxo.lovelace;
      details.offer.usd = (offerUtxo.lovelace / 10 ** 6) * fiatPrice * 10 ** 2;
    }

    if (lastSale) {
      details.lastSale.lovelace = lastSale;
      details.lastSale.usd = (lastSale / 10 ** 6) * fiatPrice * 10 ** 2;
    }

    //check if same address if there are 2

    if (addresses.length > 1 && addresses[0].address == addresses[1].address) {
      addresses = [addresses[0]];
    }

    setDetails(details);
    setOwner(addresses);
    setIsLoadingMarket(false);
  };

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title={"SpaceBudz | SpaceBud #" + spacebud.id}
        description={`SpaceBud #${spacebud.id}`}
        image={spacebud.image}
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          marginTop: 150,
          marginBottom: 100,
        }}
      >
        <div
          style={{
            position: "relative",
            paddingBottom: 35,
            width: "95%",
            borderRadius: 10,
            backgroundImage: `url(${Show})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "white",
          }}
        >
          <div
            style={{
              zIndex: 10,
              position: "absolute",
              left: 25,
              top: 25,
              cursor: "pointer",
            }}
            onClick={() => onOpen()}
          >
            <Share2 size={26} />
          </div>
          {/* Modal */}
          <ShareModal
            bud={spacebud}
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
          />
          <TradeModal
            budId={spacebud.id}
            ref={tradeRef}
            market={market.current}
            details={details}
            onConfirm={checkTransaction}
          />
          {/* Modal End */}
          <div
            style={{
              width: !matches.md ? 410 : 350,
              height: !matches.md ? 410 : 350,
              borderRadius: "50%",
              marginTop: -15,
              marginBottom: -50,
            }}
          >
            <div style={{ width: "100%", position: "relative" }}>
              {(spacebud.id == 1903 || spacebud.id == 6413) && (
                <img
                  src={spacebud.image}
                  style={{
                    position: "absolute",
                    left: 20,
                    top: -12,
                    filter: "brightness(0.7)",
                  }}
                  width="100%"
                />
              )}
              <img
                src={spacebud.image}
                style={{ position: "absolute" }}
                width="100%"
              />
            </div>
          </div>
          <Box h={5} />
          <div style={{ fontWeight: 600, fontSize: 30 }}>
            SpaceBud #{spacebud.id}
          </div>

          <LinkName onClick={() => navigate(`/explore/?type=${spacebud.type}`)}>
            {spacebud.type} Astronaut
          </LinkName>
        </div>
        <Box h={6} />
        {(spacebud.id == 1903 || spacebud.id == 6413) && (
          <>
            <div
              style={{
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ marginTop: -5 }}>Twins</div>
              <Box w={2} />
            </div>{" "}
            <Box h={3} />
          </>
        )}
        {owner.length > 0 ? (
          owner.map((item, i) => (
            <div
              key={i}
              style={{
                marginBottom: 5,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                border: "solid 2px #311b92",
                borderRadius: 25,
                color: "#777777",
              }}
            >
              <span>
                <b>Owner:</b>{" "}
              </span>
              <div
                style={{
                  width: "200px",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <MiddleEllipsis>
                  <Link
                    underline
                    color="purple.600"
                    onClick={(e) => {
                      if (owner) navigate(`/profile?address=${item.address}`);
                    }}
                  >
                    {item.address}
                  </Link>
                </MiddleEllipsis>
              </div>
            </div>
          ))
        ) : (
          <>
            <Box h={3} />
            <Box display="flex" alignItems="center">
              <Text color="GrayText" mr="4">
                Owner
              </Text>{" "}
              <Spinner size="sm" color="purple" />
            </Box>
          </>
        )}

        <Box h={8} />
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {isLoadingMarket ? (
            <Box display="flex" alignItems="center">
              <Text color="GrayText" mr="4">
                Loading Market
              </Text>{" "}
              <Spinner size="sm" color="purple" />
            </Box>
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Box textAlign="center">
                <div
                  style={{ fontSize: 12, fontWeight: "bold", marginBottom: 4 }}
                >
                  Last Sale
                </div>
                <UnitDisplay
                  showQuantity={!Boolean(details.lastSale.lovelace)}
                  fontWeight="medium"
                  quantity={details.lastSale.lovelace || 0}
                  symbol="ADA"
                  decimals={6}
                />
                <UnitDisplay
                  showQuantity={!Boolean(details.lastSale.usd)}
                  fontSize={12}
                  color="#777777"
                  quantity={details.lastSale.usd || 0}
                  symbol="USD"
                  decimals={2}
                />
              </Box>
              <Box h={6} />
              <Box position="absolute">
                <Box position="absolute" top="-30px" left={-40}>
                  {" "}
                  <RepeatIcon cursor="pointer" onClick={loadSpaceBudData} />
                </Box>
              </Box>
              <Box display="flex" alignItems="center">
                {details.offer.owner ? (
                  <>
                    <Box
                      width={matches.md ? "100px" : "150px"}
                      textAlign="right"
                    >
                      <div style={{ fontSize: 12 }}>Sell now price</div>
                      <UnitDisplay
                        showQuantity={!Boolean(details.bid.lovelace)}
                        fontWeight="medium"
                        quantity={details.bid.lovelace || 0}
                        symbol="ADA"
                        decimals={6}
                      />
                      <UnitDisplay
                        showQuantity={!Boolean(details.bid.usd)}
                        fontSize={12}
                        color="#777777"
                        quantity={details.bid.usd || 0}
                        symbol="USD"
                        decimals={2}
                      />
                    </Box>
                    <Box w={5} />
                    {details.bid.owner ? (
                      <Tooltip label="Cancel Bid" rounded="3xl">
                        <Button
                          isDisabled={loadingButton.cancelBid}
                          isLoading={loadingButton.cancelBid}
                          onClick={async () => {
                            if (!connected) return;
                            setLoadingButton((l) => ({
                              ...l,
                              cancelBid: true,
                            }));
                            const txHash = await market.current
                              .cancelBid(details.bid.bidUtxo)
                              .catch((e) => tradeErrorHandler(e, toast));
                            setLoadingButton((l) => ({
                              ...l,
                              cancelBid: false,
                            }));
                            checkTransaction(txHash);
                          }}
                          rounded="3xl"
                          size="md"
                          color="white"
                          bgColor="red.300"
                          colorScheme="red"
                        >
                          Cancel
                        </Button>
                      </Tooltip>
                    ) : (
                      <Tooltip
                        label={
                          details.offer.offerUtxo &&
                          connected ==
                            details.offer.offerUtxo.tradeOwnerAddress.to_bech32() &&
                          "Cancel Offer first"
                        }
                        rounded="3xl"
                      >
                        <Button
                          isDisabled={
                            !Boolean(details.bid.lovelace) || loadingButton.sell
                          }
                          isLoading={loadingButton.sell}
                          rounded="3xl"
                          size="md"
                          colorScheme="purple"
                          width="min"
                          bgcolor="#263238"
                          rounded="3xl"
                          width="min"
                          onClick={async () => {
                            if (
                              !connected ||
                              (details.offer.offerUtxo &&
                                connected ==
                                  details.offer.offerUtxo.tradeOwnerAddress.to_bech32())
                            )
                              return;
                            setLoadingButton((l) => ({
                              ...l,
                              sell: true,
                            }));
                            const txHash = await market.current
                              .sell(details.bid.bidUtxo)
                              .catch((e) => tradeErrorHandler(e, toast));
                            setLoadingButton((l) => ({
                              ...l,
                              sell: false,
                            }));
                            checkTransaction(txHash, {
                              type: "sold",
                              lovelace: details.bid.lovelace,
                            });
                          }}
                        >
                          Sell
                        </Button>
                      </Tooltip>
                    )}
                    <Box w={4} />
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {details.offer.lovelace &&
                      details.offer.offerUtxo &&
                      connected ==
                        details.offer.offerUtxo.tradeOwnerAddress.to_bech32() ? (
                        <Tooltip label="Cancel Offer" rounded="3xl">
                          <Button
                            isDisabled={loadingButton.cancelOffer}
                            isLoading={loadingButton.cancelOffer}
                            onClick={async () => {
                              if (!connected) return;
                              setLoadingButton((l) => ({
                                ...l,
                                cancelOffer: true,
                              }));
                              const txHash = await market.current
                                .cancelOffer(details.offer.offerUtxo)
                                .catch((e) => tradeErrorHandler(e, toast));
                              setLoadingButton((l) => ({
                                ...l,
                                cancelOffer: false,
                              }));
                              checkTransaction(txHash);
                            }}
                            color="white"
                            bgColor="red.300"
                            colorScheme="red"
                            rounded="3xl"
                            aria-label="Add to friends"
                            icon={<SmallCloseIcon />}
                          >
                            Cancel
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          variant="outline"
                          rounded="3xl"
                          colorScheme="gray"
                          onClick={() => {
                            if (!connected) return;
                            tradeRef.current.openModal({
                              minPrice: "70000000",
                              type: "OFFER",
                            });
                          }}
                        >
                          {/* Offer */}
                          List
                        </Button>
                      )}
                    </Box>
                    <Box w={5} />
                    <Box width={matches.md ? "100px" : "150px"}>
                      <div style={{ fontSize: 12 }}>Ask price</div>
                      <UnitDisplay
                        showQuantity={!Boolean(details.offer.lovelace)}
                        fontWeight="medium"
                        quantity={details.offer.lovelace || 0}
                        symbol="ADA"
                        decimals={6}
                      />
                      <UnitDisplay
                        showQuantity={!Boolean(details.offer.usd)}
                        fontSize={12}
                        color="#777777"
                        quantity={details.offer.usd || 0}
                        symbol="USD"
                        decimals={2}
                      />
                    </Box>{" "}
                  </>
                ) : (
                  <>
                    {" "}
                    <Box
                      width={matches.md ? "100px" : "150px"}
                      textAlign="right"
                    >
                      <div style={{ fontSize: 12 }}>Buy now price</div>
                      <UnitDisplay
                        showQuantity={!Boolean(details.offer.lovelace)}
                        fontWeight="medium"
                        quantity={details.offer.lovelace || 0}
                        symbol="ADA"
                        decimals={6}
                      />
                      <UnitDisplay
                        showQuantity={!Boolean(details.offer.usd)}
                        fontSize={12}
                        color="#777777"
                        quantity={details.offer.usd || 0}
                        symbol="USD"
                        decimals={2}
                      />
                    </Box>
                    <Box w={5} />
                    <Tooltip
                      label={
                        (!connected && "Connect wallet") ||
                        (details.bid.owner &&
                          details.bid.lovelace &&
                          "Cancel Bid first")
                      }
                      rounded="3xl"
                    >
                      <Button
                        isDisabled={
                          !Boolean(details.offer.lovelace) || loadingButton.buy
                        }
                        isLoading={loadingButton.buy}
                        onClick={async () => {
                          if (!connected || details.bid.owner) return;
                          setLoadingButton((l) => ({
                            ...l,
                            buy: true,
                          }));
                          const txHash = await market.current
                            .buy(details.offer.offerUtxo)
                            .catch((e) => tradeErrorHandler(e, toast));
                          setLoadingButton((l) => ({
                            ...l,
                            buy: false,
                          }));
                          checkTransaction(txHash, {
                            type: "bought",
                            lovelace: details.offer.lovelace,
                          });
                        }}
                        rounded="3xl"
                        size="md"
                        colorScheme="purple"
                        width="min"
                      >
                        Buy
                      </Button>
                    </Tooltip>
                    <Box w={4} />
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ButtonGroup size="md" isAttached variant="outline">
                        <Tooltip
                          label={!connected && "Connect wallet"}
                          rounded="3xl"
                        >
                          <Button
                            onClick={() => {
                              if (!connected) return;
                              tradeRef.current.openModal({
                                minPrice: details.bid.lovelace
                                  ? (
                                      isBrowser() &&
                                      window.BigInt(details.bid.lovelace) +
                                        window.BigInt("10000")
                                    ).toString()
                                  : "70000000",
                                type: "BID",
                              });
                            }}
                            bgcolor="#263238"
                            rounded="3xl"
                            colorScheme="gray"
                            width="min"
                          >
                            Bid
                          </Button>
                        </Tooltip>
                        {details.bid.owner && (
                          <Tooltip label="Cancel Bid" rounded="3xl">
                            <IconButton
                              isDisabled={loadingButton.cancelBid}
                              isLoading={loadingButton.cancelBid}
                              onClick={async () => {
                                if (!connected) return;
                                setLoadingButton((l) => ({
                                  ...l,
                                  cancelBid: true,
                                }));
                                const txHash = await market.current
                                  .cancelBid(details.bid.bidUtxo)
                                  .catch((e) => tradeErrorHandler(e, toast));
                                setLoadingButton((l) => ({
                                  ...l,
                                  cancelBid: false,
                                }));
                                checkTransaction(txHash);
                              }}
                              bgColor="red.300"
                              variant="solid"
                              rounded="3xl"
                              aria-label="Add to friends"
                              icon={<SmallCloseIcon />}
                            />
                          </Tooltip>
                        )}
                      </ButtonGroup>
                    </Box>
                    <Box w={5} />
                    <Box width={matches.md ? "100px" : "150px"}>
                      <div style={{ fontSize: 12 }}>Bid price</div>
                      <UnitDisplay
                        showQuantity={!Boolean(details.bid.lovelace)}
                        fontWeight="medium"
                        quantity={details.bid.lovelace || 0}
                        symbol="ADA"
                        decimals={6}
                      />
                      <UnitDisplay
                        showQuantity={!Boolean(details.bid.usd)}
                        fontSize={12}
                        color="#777777"
                        quantity={details.bid.usd || 0}
                        symbol="USD"
                        decimals={2}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
        </div>
        {!isLoadingMarket && (
          <>
            <Box h={3} />
            <Box fontSize={12} color="GrayText">
              Service Fee ~2.4%
            </Box>{" "}
          </>
        )}
        <Box h={8} />
        <div style={{ fontSize: 26, color: "#777777", fontWeight: 600 }}>
          Gadgets
        </div>
        <Box h={3} />
        <div
          style={{
            width: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {spacebud.gadgets.length > 0 ? (
              spacebud.gadgets.map((gadget, index) => (
                <Box p="1">
                  <Attribute
                    key={index}
                    onClick={() => navigate(`/explore/?gadget=${gadget}`)}
                  >
                    {gadget}
                  </Attribute>
                </Box>
              ))
            ) : (
              <div style={{ fontSize: 14, opacity: 0.3 }}>No Gadgets</div>
            )}
          </Box>
        </div>
      </div>
    </>
  );
};

const LinkName = styled.span`
  cursor: pointer;
  color: white;
  &:hover {
    text-decoration: underline;
  }
`;

const Attribute = (props) => {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LinkName onClick={() => props.onClick()}>
        <div
          style={{
            display: "table",
            height: 20,
            backgroundColor: "#9575cd",
            padding: "3px 6px",
            borderRadius: 25,
            fontSize: 14,
            color: "white",
            fontWeight: 500,
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          {props.children}
        </div>
      </LinkName>
    </Box>
  );
};

export default SpaceBud;
