import * as React from "react";
import { graphql, navigate, useStaticQuery } from "gatsby";
import {
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
  getSelectedWallet,
  valueToAssets,
} from "../utils";
import { useStoreActions, useStoreState } from "easy-peasy";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { getBalance, getBids, getListings } from "../api";
import { POLICY_ID } from "../config";
import { ExternalLink } from "@styled-icons/evaicons-solid/ExternalLink";
import { StringParam, useQueryParam } from "use-query-params";

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

      const isOwner = (owner) =>
        wallet.address === address && selectedWalletAddresses.length > 0
          ? selectedWalletAddresses.some((addr) => addr === owner)
          : false;

      const balance: Asset[] =
        wallet.address === address
          ? valueToAssets(await selectedWallet.getBalance())
          : await getBalance(address);

      const listings = await getListings();
      const bids = await getBids();

      const accountListings: NodeContent[] = listings
        .filter(
          (listing) => listing.owner === address || isOwner(listing.owner)
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
          };
        });
      const accountBids: NodeContent[] = bids
        .filter((bid) => bid.owner === address || isOwner(bid.owner))
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
          };
        });

      const lovelace = balance.find((am) => am.unit === "lovelace")?.quantity;

      const accountOwned: NodeContent[] = balance
        .filter((am) => am.unit.startsWith(POLICY_ID))
        .map((am) => {
          const budId = parseInt(
            Buffer.from(am.unit.slice(56), "hex")
              .toString()
              .split("SpaceBud")[1]
          );
          const bid = bids.find((bid) => bid.budId === budId)?.amount;
          const image = budzMap[budId].image;
          return {
            budId,
            image,
            bid,
          };
        });

      result[0] = accountOwned.concat(accountListings);
      result[1] = accountBids;
      result[2] = accountListings;

      await new Promise((res, rej) => setTimeout(() => res(1), 1000));
      if (isMounted.current) {
        setCategories([result[0].length, result[1].length, result[2].length]);
        if (lastAddress !== address) setIndex(0);
        setBalance(lovelace || BigInt(0));
        setArray(result);
        setLoading(false);
      }
    }
  };

  React.useEffect(() => {
    init();
  }, [address]);

  const firstRender = React.useRef(true);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (wallet.address) {
      navigate(`/profile/?address=${wallet.address}`);
    }
  }, [wallet]);

  return (
    <MainLayout title="SpaceBudz | Profile" titleTwitter="SpaceBudz: Profile">
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
            <div className="w-full lg:w-1/4 flex flex-grow relative px-6 md:px-8">
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
                {wallet.address === address ? (
                  <div className="text-slate-500 mt-2">
                    Your wallet is currently connected to this account address.
                    You are viewing the whole balance belonging to the wallet.
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
                      highlightBuy={index === 2}
                      highligtBid={index === 0 || index === 1}
                      key={key}
                      node={node}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full font-medium text-slate-500 flex justify-center items-center mt-10 lg:mt-0">
                  {index === 0 && "No SpaceBud found :("}
                  {index === 1 && "No bids found"}
                  {index === 2 && "No listings found"}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
