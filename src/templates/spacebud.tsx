import * as React from "react";
import { graphql, Link } from "gatsby";
import { Button, Ellipsis, Image, Spinner } from "../components";
import {
  CONTRACT_ADDRESS,
  EXTRA_RECEIVING_ADDRESS,
  POLICY_ID,
  TYPES_GADGETS_COUNT,
} from "../config";
import { useIsMounted } from "../hooks";
import { MainLayout } from "../layouts/mainLayout";
import {
  fromLovelace,
  fromLovelaceDisplay,
  getAddressBech32,
  getSelectedWallet,
  ipfsToHttps,
} from "../utils";
import { useStoreState } from "easy-peasy";
import Market from "../cardano/market";
import secrets from "../../secrets";
import { SpecialButton } from "../parts/spacebud/SpecialButton";
import {
  baseUrl,
  getLastSale,
  getOwners,
  getPriceUSD,
  projectId,
} from "../api";
import { checkTx, ConfirmDialog, TradeDialog } from "../parts/spacebud/Dialog";
import { downloadPFP } from "../parts/spacebud/utils";
import { Sigil } from "../parts/spacebud/Sigil";
import { Discord } from "@styled-icons/bootstrap/Discord";
import { Mail } from "@styled-icons/ionicons-solid/Mail";
import { TwitterSquare } from "@styled-icons/fa-brands/TwitterSquare";
import { checkTxIdentity, IdentityDialog } from "../parts/spacebud/Identity";
import { Lucid, Blockfrost, Contract } from "@spacebudz/spacebudz-identity";

const SpaceBud = ({ data, pageContext: { budId } }) => {
  const { name, traits, image, type } = data.allMetadataJson.edges[0].node;
  const imageLink = ipfsToHttps(image);
  const [loading, setLoading] = React.useState(false);
  const wallet = useStoreState<any>((state) => state.wallet.wallet);

  const defaultDetails = {
    bid: { bidUtxo: null, lovelace: null, usd: null, owner: false },
    listing: { listingUtxo: null, lovelace: null, usd: null, owner: false },
    lastSale: { lovelace: null, usd: null },
  };

  const [details, setDetails] = React.useState(defaultDetails);
  const [owners, setOwners] = React.useState([]);
  const [identity, setIdentity] = React.useState<{
    nickname?: string;
    color?: string;
    urbit?: string[];
    twitter?: string[];
    discord?: string[];
    email?: string[];
  }>({});

  const confirmRef = React.useRef<any>();
  const tradeRef = React.useRef<any>();
  const identityRef = React.useRef<any>();

  const loadData = async () => {
    isMounted.current && setLoading(true);
    const selectedWallet = await getSelectedWallet();

    const contract = new Contract(
      await Lucid.new(new Blockfrost(baseUrl, projectId))
    );

    const walletAddresses = wallet.address
      ? (await selectedWallet.getUsedAddresses()).map((address) =>
          getAddressBech32(address)
        )
      : [];

    const unit = POLICY_ID + Buffer.from(`SpaceBud${budId}`).toString("hex");
    const owners = await getOwners(unit);
    let usdPrice = 0;
    try {
      usdPrice = await getPriceUSD();
    } catch (e) {}
    const lastSale = await getLastSale(budId);

    const bidUtxo = await market.getBid(budId);
    let listingUtxo: any = await market.getOffer(budId);

    const details = JSON.parse(
      JSON.stringify({
        bid: { bidUtxo: null, lovelace: null, usd: null, owner: false },
        listing: { listingUtxo: null, lovelace: null, usd: null, owner: false },
        lastSale: { lovelace: null, usd: null },
      })
    );

    const isOwner = (address: string): boolean =>
      walletAddresses.some((_address) => _address === address);

    const replaceContractWithOwner = (address: string) => {
      const index = owners.indexOf(CONTRACT_ADDRESS);
      if (index !== -1) owners[index] = address;
    };

    /* Listing is a twin: 1903 or 6413 */
    if (Array.isArray(listingUtxo)) {
      if (listingUtxo.length === 2 && (budId === 1903 || budId === 6413)) {
        const ownListingUtxo = listingUtxo.find((utxo) =>
          isOwner(utxo.tradeOwnerAddress.to_bech32())
        );
        if (ownListingUtxo) listingUtxo = ownListingUtxo;
        else {
          /* Replace contract address with actual owner address from datum */
          const listingUtxo0 = listingUtxo[0];
          const listingUtxo1 = listingUtxo[1];
          replaceContractWithOwner(listingUtxo0.tradeOwnerAddress.to_bech32());
          replaceContractWithOwner(listingUtxo1.tradeOwnerAddress.to_bech32());

          /* Prefer smaller amount utxo to be displayed */
          if (BigInt(listingUtxo0.lovelace) < BigInt(listingUtxo1.lovelace))
            listingUtxo = listingUtxo;
          else listingUtxo = listingUtxo1;
        }
      } else
        throw new Error(
          "Listing utxo is an array but doesn't include a twin 1903 or 6413."
        );
    }

    details.bid.bidUtxo = bidUtxo;
    details.listing.listingUtxo = listingUtxo;

    if (
      // if not a StartBid
      bidUtxo.datum.as_constr_plutus_data().alternative().to_str() !== "0"
    ) {
      if (isOwner(bidUtxo.tradeOwnerAddress.to_bech32())) {
        details.bid.owner = true;
      }
      details.bid.lovelace = BigInt(bidUtxo.lovelace);
      details.bid.usd = (
        fromLovelace(BigInt(bidUtxo.lovelace)) * usdPrice
      ).toLocaleString("en-EN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }

    if (owners.find((address) => isOwner(address)))
      details.listing.owner = true;

    if (listingUtxo) {
      const listingAddress = listingUtxo.tradeOwnerAddress.to_bech32();
      replaceContractWithOwner(listingAddress);
      if (isOwner(listingAddress)) {
        details.listing.owner = true;
      }
      details.listing.lovelace = BigInt(listingUtxo.lovelace);
      details.listing.usd = (
        fromLovelace(BigInt(listingUtxo.lovelace)) * usdPrice
      ).toLocaleString("en-EN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }

    if (lastSale) {
      details.lastSale.lovelace = lastSale;
      details.lastSale.usd = (fromLovelace(lastSale) * usdPrice).toLocaleString(
        "en-EN",
        {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }
      );
    }

    /* if both owner address are the same no need to display two addresses => consolidate to one */
    if (owners.length >= 2 && owners[0] === owners[1]) {
      delete owners[1];
    }

    /* Check identity */
    const identity = await contract.getIdentity(budId);
    setIdentity({
      ...identity,
    });

    if (isMounted.current) {
      setDetails(details);
      setOwners(owners);
      setLoading(false);
    }
  };

  const { current: market } = React.useRef(
    new Market(
      {
        base: "https://cardano-mainnet.blockfrost.io/api/v0",
        projectId: secrets.PROJECT_ID,
      },
      EXTRA_RECEIVING_ADDRESS
    )
  );

  const isMounted = useIsMounted();
  const firstRender = React.useRef(true);
  const init = async () => {
    setLoading(true);
    if (firstRender.current) {
      await market.load();
      firstRender.current = false;
      window.addEventListener("confirm", loadData);
    }
    await loadData();
  };

  React.useEffect(() => {
    init();
    return () => {
      window.removeEventListener("confirm", loadData);
    };
  }, [wallet]);

  return (
    <MainLayout
      title={`SpaceBudz | ${name}`}
      description={name}
      image={imageLink}
    >
      <>
        <div className="w-full flex flex-wrap mb-40">
          <div className="w-full lg:w-2/4 flex flex-grow relative">
            <div className="w-full lg:sticky lg:top-4 pb-[100%] md:pb-[80%] lg:pb-0 bg-slate-800 border-2 border-b-4 border-slate-900 rounded-xl mx-4 mb-4 lg:mx-0 lg:mb-0 lg:ml-4 md:h-[calc(100vh-9rem)] relative">
              <div className="absolute left-0 top-0 flex justify-center items-center w-full h-full">
                <div className="flex justify-center items-center w-full">
                  <div className="w-[90%] md:w-[80%] md:max-w-3xl">
                    <div className="w-full h-full max-h-36 flex justify-center items-center">
                      <Image src={`${imageLink}`} />
                    </div>
                  </div>
                </div>
              </div>
              <Button
                className="absolute bottom-3 right-3"
                theme="space"
                size="sm"
                onClick={() => {
                  downloadPFP(budId, imageLink, identity?.color);
                }}
              >
                PFP
              </Button>
            </div>
          </div>
          <div className="w-full lg:w-2/4 px-8 lg:px-10 flex flex-col">
            <div className="text-4xl font-bold font-title">{name}</div>
            <Link to={`/explore/?type=${type}`}>
              <div className="text-3xl font-semibold font-title text-slate-500">
                {type}
              </div>
            </Link>
            {loading ? (
              <div className="w-full mt-16 lg:mt-0 flex-grow flex justify-center items-center flex-col">
                <Spinner theme="violet" className="!w-6 md:!w-8" />
                <div className="mt-8 md:mt-10 font-medium text-slate-500">
                  Loading SpaceBud...
                </div>
              </div>
            ) : (
              <>
                {identity?.nickname && (
                  <div
                    className={`text-3xl font-bold font-title mt-4`}
                    style={{ color: identity?.color }}
                  >
                    {identity?.nickname}
                  </div>
                )}
                <div className="h-10" />
                <div className="flex flex-wrap">
                  <div className="mr-8 mb-6">
                    <div className="text-2xl font-semibold mb-2">Listing</div>
                    <div className="h-14">
                      {details.listing.lovelace ? (
                        <>
                          <span className="text-xl font-bold text-primary">
                            {fromLovelaceDisplay(details.listing.lovelace)}
                          </span>
                          <br />
                          <span className="text-slate-500">
                            {details.listing.usd} $
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-500">Not listed</span>
                      )}
                    </div>
                    <div className="mt-4">
                      {details.listing.owner ? (
                        <SpecialButton
                          disabledMessage={
                            details.listing.lovelace &&
                            "To update listing cancel it first"
                          }
                          onClick={() => {
                            tradeRef.current.open({
                              type: "List",
                              minAda: BigInt(70000000),
                            });
                          }}
                          cancel={
                            details.listing.lovelace
                              ? () => {
                                  confirmRef.current.open({
                                    type: "CancelListing",
                                    lovelace: details.listing.lovelace,
                                  });
                                }
                              : null
                          }
                          theme="violet"
                          className="w-36"
                        >
                          List
                        </SpecialButton>
                      ) : (
                        <SpecialButton
                          onClick={() => {
                            confirmRef.current.open({
                              type: "Buy",
                              lovelace: details.listing.lovelace,
                            });
                          }}
                          theme="violet"
                          className="w-36"
                          disabledMessage={
                            (!wallet.address &&
                              "Login to buy and make offers") ||
                            !details.listing.lovelace ||
                            (details.bid.owner && "To buy cancel offer first")
                          }
                        >
                          Buy
                        </SpecialButton>
                      )}
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="text-2xl font-semibold mb-2">Bid</div>
                    <div className="h-14">
                      {details.bid.lovelace ? (
                        <>
                          <span className="text-xl font-bold text-orange-500">
                            {fromLovelaceDisplay(details.bid.lovelace)}
                          </span>
                          <br />
                          <span className="text-slate-500">
                            {details.bid.usd} $
                          </span>{" "}
                        </>
                      ) : (
                        <span className="text-gray-500">No offer</span>
                      )}
                    </div>
                    <div className="flex justify-center items-center mt-4">
                      {details.listing.owner && !details.bid.owner ? (
                        <SpecialButton
                          onClick={() => {
                            confirmRef.current.open({
                              type: "Sell",
                              lovelace: details.bid.lovelace,
                            });
                          }}
                          theme="orange"
                          className="w-36"
                          disabledMessage={
                            (details.listing.lovelace &&
                              details.bid.lovelace &&
                              "To sell cancel listing first") ||
                            !details.bid.lovelace
                          }
                        >
                          Sell
                        </SpecialButton>
                      ) : (
                        <SpecialButton
                          onClick={() => {
                            tradeRef.current.open({
                              type: "Offer",
                              minAda: details.bid.lovelace
                                ? details.bid.lovelace + BigInt(10000)
                                : BigInt(70000000),
                            });
                          }}
                          theme="orange"
                          className="w-36"
                          cancel={
                            details.bid.owner
                              ? () => {
                                  confirmRef.current.open({
                                    type: "CancelBid",
                                    lovelace: details.bid.lovelace,
                                  });
                                }
                              : null
                          }
                          disabledMessage={
                            !wallet.address ||
                            (details.listing.owner && details.bid.owner)
                          }
                        >
                          Make offer
                        </SpecialButton>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-2xl font-semibold mb-2">Last sale</div>
                <div>
                  {details.lastSale.lovelace ? (
                    <>
                      <span className="text-xl font-bold text-primary">
                        {fromLovelaceDisplay(details.lastSale.lovelace)}
                      </span>
                      <br />
                      <span className="text-slate-500">
                        {details.lastSale.usd} $
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
                <div className="h-8" />
                <div className="text-2xl font-semibold mb-2">
                  {owners.length > 1 ? "Owners" : "Owner"}
                </div>
                {owners.map((owner, key) => (
                  <Link
                    key={key}
                    className="font-bold cursor-pointer w-fit"
                    to={`/profile/?address=${owner}`}
                  >
                    <Ellipsis className="w-full max-w-[16rem]">
                      {owner}
                    </Ellipsis>
                  </Link>
                ))}
                <div className="h-10" />
                <div className="text-2xl font-semibold mb-2">Gadgets</div>
                <div className="w-full max-w-3xl flex items-center flex-wrap">
                  {traits.length <= 0 ? (
                    <div className="text-gray-500">No gadgets</div>
                  ) : (
                    traits.map((trait, index) => (
                      <Link
                        className="px-2 py-1 m-1 ml-0 rounded-xl border-2 text-gray-500 font-semibold cursor-pointer"
                        key={index}
                        to={`/explore/?gadget=${trait}`}
                      >
                        {trait} ({TYPES_GADGETS_COUNT.gadgets[trait]})
                      </Link>
                    ))
                  )}
                </div>
                {(identity?.urbit ||
                  identity?.twitter ||
                  identity?.discord ||
                  identity?.email ||
                  details.listing.owner) && (
                  <>
                    <div className="h-10" />
                    <div className="text-2xl font-semibold mb-2">Identity</div>
                    <div className="w-full max-w-3xl flex items-center flex-wrap">
                      {identity?.urbit &&
                        identity?.urbit.map((patp) => (
                          <div className="flex flex-row justify-center items-center pr-6 py-4">
                            <Sigil patp={patp} size={30} />
                            <div className="ml-3 font-semibold">{patp}</div>
                          </div>
                        ))}
                      {identity?.twitter &&
                        identity?.twitter.map((profile) => (
                          <div className="flex flex-row justify-center items-center pr-6 py-4">
                            <TwitterSquare size={30} />
                            <div className="ml-3 font-semibold">{profile}</div>
                          </div>
                        ))}
                      {identity?.discord &&
                        identity?.discord.map((username) => (
                          <div className="flex flex-row justify-center items-center pr-6 py-4">
                            <Discord size={30} />
                            <div className="ml-3 font-semibold">{username}</div>
                          </div>
                        ))}
                      {identity?.email &&
                        identity?.email.map((email) => (
                          <div className="flex flex-row justify-center items-center pr-6 py-4">
                            <Mail size={30} />
                            <div className="ml-3 font-semibold">{email}</div>
                          </div>
                        ))}
                    </div>
                    {details.listing.owner && (
                      <div className="mt-6">
                        <Button
                          onClick={() => identityRef.current.open()}
                          size="sm"
                          theme="white"
                        >
                          Update identity
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <ConfirmDialog
          ref={confirmRef}
          market={market}
          details={details}
          budId={budId}
          checkTx={({ txHash }) =>
            checkTx({
              txHash,
              market,
            })
          }
        />
        <TradeDialog
          ref={tradeRef}
          market={market}
          details={details}
          budId={budId}
          checkTx={({ txHash }) =>
            checkTx({
              txHash,
              market,
            })
          }
        />
        <IdentityDialog
          ref={identityRef}
          identity={identity}
          budId={budId}
          checkTx={({ txHash }) =>
            checkTxIdentity({
              txHash,
            })
          }
        />
      </>
    </MainLayout>
  );
};

export const query = graphql`
  query MetadataQuery($budId: Int) {
    allMetadataJson(filter: { budId: { eq: $budId } }) {
      edges {
        node {
          name
          traits
          image
          type
        }
      }
    }
  }
`;

export default SpaceBud;
