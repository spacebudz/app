import * as React from "react";
import { graphql, navigate, useStaticQuery } from "gatsby";
import {
  Button,
  Card,
  Ellipsis,
  NodeContent,
  RadioGroup,
  Spinner,
} from "../components";
import { useIsMounted } from "../hooks";
import { MainLayout } from "../layouts/mainLayout";
import {
  Asset,
  fromLovelaceDisplay,
  getAddressBech32,
  getLucid,
  getNebula,
  getSelectedWallet,
  getWormhole,
  isBrowser,
  valueToAssets,
} from "../utils";
import { useStoreActions, useStoreState } from "easy-peasy";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import {
  baseUrl,
  getAllMigrated,
  getBalance,
  getBids,
  getListings,
} from "../api";
import {
  DEPRECATED_POLICY_ID,
  EXTRA_RECEIVING_ADDRESS,
  POLICY_ID,
} from "../config";
import { ExternalLink } from "@styled-icons/evaicons-solid/ExternalLink";
import { StringParam, useQueryParam } from "use-query-params";
import { checkTx, ConfirmDialog } from "../parts/spacebud/Dialog";
import Market from "../cardano/market";
import secrets from "../../secrets";
import { fromUnit, paymentCredentialOf, toText } from "lucid-cardano";
import { Contract as Wormhole } from "@spacebudz/wormhole";
import * as Nebula from "@spacebudz/nebula";

const Profile = () => {
  const [address] = useQueryParam("address", StringParam);
  const data = useStaticQuery(graphql`
    query {
      allMetadataJson {
        edges {
          node {
            budId
            image
          }
        }
      }
    }
  `);

  const budzArrayToMap = () => {
    const budzMap = {};
    data.allMetadataJson.edges.forEach((node) => {
      budzMap[node.node.budId] = {
        budId: node.node.budId,
        image: node.node.image,
      };
    });
    return budzMap;
  };

  const budzMap = budzArrayToMap();

  const breakpoints = useBreakpoint();
  const [loading, setLoading] = React.useState(false);
  const wallet = useStoreState<any>((state) => state.wallet.wallet);

  const [profileStates, profileActions] = [
    useStoreState<any>((state) => state.profile),
    useStoreActions<any>((actions) => actions.profile),
  ];
  const [array, setArray] = [profileStates.array, profileActions.setArray];
  const [lastUpdate, renewLastUpdate] = [
    profileStates.lastUpdate,
    profileActions.renewLastUpdate,
  ];
  const [index, setIndex] = [profileStates.index, profileActions.setIndex];
  const [balance, setBalance] = [
    profileStates.balance,
    profileActions.setBalance,
  ];
  const [categories, setCategories] = [
    profileStates.categories,
    profileActions.setCategories,
  ];
  const [lastAddress, setLastAddress] = [
    profileStates.lastAddress,
    profileActions.setLastAddress,
  ];

  const fillItems = (array) => [
    {
      name: "Owned",
      content: (
        <span>
          <span className="font-bold text-lg">{array[0]}</span> owned
        </span>
      ),
      index: 0,
    },
    {
      name: "Open bids",
      content: (
        <span>
          <span className="font-bold text-lg">{array[1]}</span>{" "}
          {array[1].length === 1 ? "bid" : "bids"} opened
        </span>
      ),
      index: 1,
    },
    {
      name: "Listings",
      content: (
        <span>
          <span className="font-bold text-lg">{array[2]}</span> listed
        </span>
      ),
      index: 2,
    },
  ];

  const items = fillItems(categories);

  const selectedArray = array ? array[index] : [];

  const isMounted = useIsMounted();

  const init = async () => {
    if (
      !array ||
      !lastUpdate ||
      Date.now() - lastUpdate > 20000 ||
      lastAddress !== address
    ) {
      if (!array || lastAddress !== address) {
        setLastAddress(address);
        setLoading(true);
      }
      renewLastUpdate();

      const migratedBudz: number[] = await getAllMigrated();

      const result: [NodeContent[], NodeContent[], NodeContent[]] = [
        [],
        [],
        [],
      ];
      const selectedWallet = await getSelectedWallet();
      const selectedWalletAddresses = wallet.address
        ? (await selectedWallet.getUsedAddresses()).map((addr) =>
            getAddressBech32(addr)
          )
        : [];

      const isOwner = (owner: string) =>
        wallet.address === address && selectedWalletAddresses.length > 0
          ? selectedWalletAddresses.some(
              (addr) =>
                paymentCredentialOf(addr).hash ===
                paymentCredentialOf(owner).hash
            )
          : false;

      const balance: Asset[] =
        wallet.address === address
          ? valueToAssets(await selectedWallet.getBalance())
          : await getBalance(address);

      const listings = await getListings();
      const bids = await getBids();

      const accountListings: NodeContent[] = listings
        .filter(
          (listing) =>
            paymentCredentialOf(listing.owner).hash ===
              paymentCredentialOf(address).hash || isOwner(listing.owner)
        )
        .map((listing) => {
          const bid = bids.find((bid) => bid.budId === listing.budId)?.amount;
          const buy = listing.amount;
          const budId = listing.budId;
          const image = budzMap[budId].image;
          return {
            budId,
            image,
            bid,
            buy,
            viewType: "Listing",
            needsToMigrate: !migratedBudz.includes(budId),
            isNebula: listing.isNebula,
            outRef: listing.outRef,
          };
        });
      const accountBids: NodeContent[] = bids
        .filter(
          (bid) =>
            paymentCredentialOf(bid.owner).hash ===
              paymentCredentialOf(address).hash || isOwner(bid.owner)
        )
        .map((b) => {
          const buy = listings.find(
            (listing) => b.budId === listing.budId
          )?.amount;
          const bid = b.amount;
          const budId = b.budId;
          const image = budzMap[budId].image;
          return {
            budId,
            image,
            bid,
            buy,
            viewType: "Bid",
            needsToMigrate: !migratedBudz.includes(budId),
            isNebula: b.isNebula,
            outRef: b.outRef,
          };
        });

      const lovelace = balance.find((am) => am.unit === "lovelace")?.quantity;

      let notMigrated = 0;
      const accountOwned: NodeContent[] = balance
        .filter(
          (am) =>
            am.unit.startsWith(DEPRECATED_POLICY_ID) ||
            am.unit.startsWith(POLICY_ID)
        )
        .map((am) => {
          const isDeprecated = am.unit.startsWith(DEPRECATED_POLICY_ID);
          const budId = isDeprecated
            ? parseInt(
                Buffer.from(am.unit.slice(56), "hex")
                  .toString()
                  .split("SpaceBud")[1]
              )
            : parseInt(toText(fromUnit(am.unit).name).slice(3));
          const bid = bids.find((bid) => bid.budId === budId)?.amount;
          const image = budzMap[budId].image;

          if (isDeprecated) notMigrated += 1;

          return {
            budId,
            image,
            bid,
            needsToMigrate: isDeprecated,
            isNebula: true,
          };
        });

      result[0] = accountOwned.concat(
        accountListings.map((l) => ({ ...l, viewType: "Normal" }))
      );
      result[1] = accountBids;
      result[2] = accountListings;

      await new Promise((res, rej) => setTimeout(() => res(1), 1000));
      if (isMounted.current) {
        setCategories([result[0].length, result[1].length, result[2].length]);
        if (lastAddress !== address) setIndex(0);
        setBalance(lovelace || BigInt(0));
        setArray(result);
        setLoading(false);
        setAllMigrated(notMigrated === 0);
      }
    }
  };

  // Wormhole
  const [allMigrated, setAllMigrated] = React.useState(false);

  const confirmRef = React.useRef<any>();

  const wormhole = React.useRef<Wormhole>();

  React.useEffect(() => {
    init();
  }, [address]);

  const firstRender = React.useRef(true);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      getWormhole().then((wh) => (wormhole.current = wh));
      window.addEventListener("confirm", init);
      // Load markets

      return;
    }
    if (wallet.address) {
      navigate(`/profile/?address=${wallet.address}`);
    }
    return () => {
      window.removeEventListener("confirm", init);
    };
  }, [wallet]);

  return (
    <MainLayout title="SpaceBudz | Profile" titleTwitter="SpaceBudz: Profile">
      <>
        <div className="w-full flex flex-grow flex-wrap mb-40">
          {loading ? (
            <div className="w-full flex-grow flex justify-center items-center flex-col">
              <Spinner theme="violet" className="!w-6 md:!w-8" />
              <div className="mt-8 md:mt-10 font-medium text-slate-500">
                Loading Profile...
              </div>
            </div>
          ) : (
            <>
              {!allMigrated && (
                <div className="w-full flex items-center justify-center mb-10 flex-col">
                  <div className="w-[90%] max-w-[800px] bg-primary border-violet-600 border-2 border-b-4 rounded-xl p-4 font-bold text-white">
                    As the proud owner, you hold the key to unlocking the
                    secrets of the universe. Connect your wallet and join us on
                    the other side of the wormhole.
                    <div className="text-sm mt-4">
                      Cancel open listings in order to migrate those SpaceBudz.{" "}
                      <br />
                      You can migrate multiple SpaceBudz at the same time (about
                      4-7 SpaceBudz at max per transaction).
                    </div>
                    <Button
                      className="mt-4"
                      disabled={wallet.address !== address}
                      onClick={() => {
                        confirmRef.current.open({
                          type: "Wormhole",
                          wormhole: {
                            contract: wormhole.current,
                            ids: array[0]
                              .map((owned) => owned.budId)
                              .slice(0, 7),
                          },
                        });
                      }}
                    >
                      Migrate multiple
                    </Button>
                  </div>
                </div>
              )}
              <div className="w-full lg:w-1/4 flex flex-grow relative px-6 md:px-12">
                <div className="lg:sticky lg:top-8 h-fit w-full">
                  <div className="text-3xl font-bold mb-2 mt-4 lg:mt-0">
                    Account
                  </div>
                  <div className="text-md break-all font-bold">
                    <Ellipsis className="w-full">{address}</Ellipsis>
                    <a
                      href={`https://cardanoscan.io/address/${address}`}
                      target="_blank"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  {isBrowser() &&
                  wallet?.address &&
                  paymentCredentialOf(wallet.address).hash ===
                    paymentCredentialOf(address).hash ? (
                    <div className="text-slate-500 mt-2">
                      Your wallet is currently connected to this account
                      address. You are viewing the whole balance belonging to
                      the wallet.
                    </div>
                  ) : (
                    <div className="text-slate-500 mt-2">
                      You are viewing only the balance from this particular
                      account address.
                    </div>
                  )}
                  <div className="text-2xl font-bold mt-6 mb-2">Balance</div>
                  <div className="text-md text-xl font-semibold text-primary">
                    {fromLovelaceDisplay(BigInt(balance))}
                  </div>
                  <div className="mb-8" />
                  <div className="w-full place-self-center max-w-sm">
                    {" "}
                    <RadioGroup
                      items={items}
                      selected={index}
                      onChange={(index) => {
                        setIndex(index);
                        if (!breakpoints.lg) window.scrollTo(0, 0);
                      }}
                    />
                  </div>
                  <div className="mb-10" />
                </div>
              </div>
              <div className="w-full lg:w-3/4 px-4 lg:px-10 flex flex-col">
                {selectedArray.length > 0 ? (
                  <div className="grid grid-cols-main lg:grid-cols-mainLg gap-1 md:gap-2 overflow-hidden">
                    {array[index].map((node, key) => (
                      <Card
                        isOwner={
                          isBrowser() &&
                          wallet?.address &&
                          paymentCredentialOf(wallet.address).hash ===
                            paymentCredentialOf(address).hash
                        }
                        highlightBuy={index === 2}
                        highligtBid={index === 0 || index === 1}
                        key={key}
                        node={node}
                        onAction={async ({ type, budId, isNebula, outRef }) => {
                          switch (type) {
                            case "Wormhole": {
                              confirmRef.current.open({
                                type: "Wormhole",
                                wormhole: {
                                  contract: wormhole.current,
                                  ids: [budId],
                                },
                                budId,
                              });
                              break;
                            }
                            case "Bid": {
                              if (isNebula) {
                                const nebula = await getNebula();
                                const bid = await nebula.getListingOrBid(
                                  outRef
                                );
                                if (!bid) return;

                                confirmRef.current.open({
                                  type: "CancelBid",
                                  lovelace: bid.assets.lovelace,
                                  market: nebula,
                                  isNebula,
                                  details: { bid: { bidUtxo: bid } },
                                  budId,
                                });
                              } else {
                                const market = new Market(
                                  {
                                    base: baseUrl,
                                    projectId: secrets.PROJECT_ID,
                                  },
                                  EXTRA_RECEIVING_ADDRESS
                                );
                                await market.load();
                                const bid = await market.getBid(budId);
                                confirmRef.current.open({
                                  type: "CancelBid",
                                  lovelace: BigInt(bid.lovelace),
                                  market,
                                  isNebula,
                                  details: { bid: { bidUtxo: bid } },
                                  budId,
                                });
                              }
                              break;
                            }
                            case "Listing": {
                              if (isNebula) {
                                const lucid = await getLucid();
                                const nebula = await getNebula();
                                const listing = await nebula.getListingOrBid(
                                  outRef
                                );
                                if (!listing) return;
                                const listingDetails = (
                                  await lucid.datumOf<Nebula.TradeDatum>(
                                    listing,
                                    Nebula.TradeDatum
                                  )
                                ).Listing[0];
                                const lovelace =
                                  listingDetails.requestedLovelace;
                                confirmRef.current.open({
                                  type: "CancelListing",
                                  lovelace,
                                  market: nebula,
                                  isNebula,
                                  details: {
                                    listing: { listingUtxo: listing },
                                  },
                                  budId,
                                });
                              } else {
                                const market = new Market(
                                  {
                                    base: baseUrl,
                                    projectId: secrets.PROJECT_ID,
                                  },
                                  EXTRA_RECEIVING_ADDRESS
                                );
                                await market.load();
                                const listings = await market.getOffer(budId);

                                const selectedWallet =
                                  await getSelectedWallet();
                                const selectedWalletAddresses = wallet.address
                                  ? (
                                      await selectedWallet.getUsedAddresses()
                                    ).map((addr) => getAddressBech32(addr))
                                  : [];

                                // We ignore the fact that someone could have listed two twins at the same time.

                                const listing =
                                  listings instanceof Array
                                    ? listings.find((listing) =>
                                        selectedWalletAddresses.some(
                                          (addr) =>
                                            isBrowser() &&
                                            paymentCredentialOf(addr).hash ===
                                              paymentCredentialOf(
                                                listing.tradeOwnerAddress.to_bech32()
                                              ).hash
                                        )
                                      )
                                    : listings;

                                confirmRef.current.open({
                                  type: "CancelListing",
                                  lovelace: BigInt(listing.lovelace),
                                  market,
                                  isNebula,
                                  details: {
                                    listing: { listingUtxo: listing },
                                  },
                                  budId,
                                });
                              }
                              break;
                            }
                          }
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full font-medium text-slate-500 flex justify-center items-center mt-10 lg:mt-0">
                    {index === 0 && "No SpaceBudz found"}
                    {index === 1 && "No bids found"}
                    {index === 2 && "No listings found"}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <ConfirmDialog
          ref={confirmRef}
          checkTx={({ txHash }) =>
            checkTx({
              txHash,
            })
          }
        />
      </>
    </MainLayout>
  );
};

export default Profile;
