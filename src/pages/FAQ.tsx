import * as React from "react";
import { Disclosure } from "../components";
import { MainLayout } from "../layouts/mainLayout";

const FAQ = () => {
  return (
    <MainLayout title="SpaceBudz | FAQ" titleTwitter="SpaceBudz: FAQ">
      <div className="w-full flex justify-center items-center">
        <div className="px-6 mt-4 md:mt-0 max-w-5xl w-full">
          <div className="font-bold text-primary text-3xl mb-16">FAQ</div>
          <div className="w-full">
            <Disclosure
              title="Which wallets can I use"
              className="min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                <a
                  className="text-teal-500 font-semibold"
                  href="https://namiwallet.io"
                  target="_blank"
                >
                  Nami
                </a>
                ,{" "}
                <a
                  className="text-orange-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj"
                  target="_blank"
                >
                  Flint
                </a>{" "}
                and{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/ccvaultio/kmhcihpebfmpgmihbkipmjlmmioameka"
                  target="_blank"
                >
                  ccvault
                </a>{" "}
                can be connected to the website and used for the marketplace.
              </div>
            </Disclosure>
            <Disclosure
              title="Where are the metadata"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                The metadata for each token are on-chain and follow{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://github.com/cardano-foundation/CIPs/blob/master/CIP-0025/CIP-0025.md"
                  target="_blank"
                >
                  CIP-25
                </a>
                , which was proposed by SpaceBudz and is now used in the
                majority of NFT projects. The metadata itself links to an image
                on IPFS and Arweave in order to keep the data immutable and
                retrievable forever. The metadata are in the minting transaction
                of the token. Check out this{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://cardanoscan.io/transaction/c8671bf7fe1cd75c8a387822b84c8e4f5fe61043c60618dc9ad68d6ebcd12c7f?tab=metadata"
                  target="_blank"
                >
                  example
                </a>
                . Scroll down to the metadata and click on it to view more.
              </div>
            </Disclosure>
            <Disclosure
              title="Is this actually an NFT"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                These tokens are unique forever. The minting policy is time
                based and closed on the 22nd of August 2021.
                <br /> The minting script:
                <br />
                <br />
                <span className="break-all">
                  {`{
                    type: "all",
                    scripts: [
                      { slot: 38082894, type: "before" },
                      {
                        keyHash:
                          "c74140d3c5946dc5fdb4cf97f0c9fed6f138969005d81d3ba12b714c",
                        type: "sig"
                      }
                    ]
                  }`}
                </span>
                <br />
                <br />
                Hash it and you get the following Policy ID:
                <br />
                <a
                  className="text-purple-500 font-semibold break-all"
                  href="https://cardanoscan.io/tokenPolicy/d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc"
                  target="_blank"
                >
                  d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc
                </a>
              </div>
            </Disclosure>{" "}
            <Disclosure
              title="Does the market place use smart contracts"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                Yes the market place is fully based on a contract. There is no
                3rd party or middleman involved.
                <br /> The contract address:{" "}
                <a
                  className="text-purple-500 font-semibold break-all"
                  href="https://cardanoscan.io/address/addr1wyzynye0nksztrfzpsulsq7whr3vgh7uvp0gm4p0x42ckkqqq6kxq"
                  target="_blank"
                >
                  addr1wyzynye0nksztrfzpsulsq7whr3vgh7uvp0gm4p0x42ckkqqq6kxq
                </a>
                <br />
                <br />
                The full source code you can find{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://github.com/Berry-Pool/spacebudz"
                  target="_blank"
                >
                  here
                </a>
                .
              </div>
            </Disclosure>
            <Disclosure
              title="How does the marketplace work"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                <div className="mb-6">
                  The marketplace consists of these four main functionalities:
                </div>
                <div className="font-bold text-lg mb-2 text-primary">Bid</div>
                <div>
                  {" "}
                  Bids can be opened on any SpaceBudz. The bid amount is locked
                  inside the contract. The bid amount stays as long in the
                  contract until the bid is either accepted, the bid is canceled
                  or someone else overbids the current bidder. The current
                  bidder gets automatically refunded.
                </div>
                <div className="font-bold text-lg mt-4 mb-2 text-primary">
                  Listing
                </div>
                <div>
                  Listings can be made by the current holders of the SpaceBudz.
                  The SpaceBud will be locked inside the contract. The SpaceBud
                  stays as long in the contract until the listing is accepted or
                  the the listing is canceled.
                </div>
                <div className="font-bold text-lg mt-4 mb-2 text-primary">
                  Buy
                </div>
                <div>
                  A listed SpaceBud can be bought. The buyer needs to send the
                  requested ADA to the offerer in order to claim the SpaceBud
                  from the contract (happens all in the contract transaction of
                  course).
                </div>
                <div className="font-bold text-lg mt-4 mb-2 text-primary">
                  Sell
                </div>
                <div>
                  A bid on SpaceBud can be sold by the owner. The seller needs
                  to send the right SpaceBud to the bidder in order to claim the
                  ADA amount from the contract (happens all in the contract
                  transaction of course).
                </div>
              </div>
            </Disclosure>
            <Disclosure
              title="Is my bid or listing locked in the contract"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                Yes it is locked in the contract, but you can always cancel the
                bid/listing and reclaim your funds. But a buyer/seller has of
                course always the opportunity to accept your bid/listing as long
                as your funds are in the contract.
              </div>
            </Disclosure>
            <Disclosure
              title="What fees are involved in the market place"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                Besides Cardano network fees, the market place charges a 2.4%
                service fee. 0.4% of it are available to market place hosting
                providers. Find out more about it{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://github.com/Berry-Pool/spacebudz/tree/main/src/cardano/market"
                  target="_blank"
                >
                  here
                </a>
                .
              </div>
            </Disclosure>
            <Disclosure
              title="I get the error: Transaction failed"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                Make sure you have enough funds to cover your trade. Try to
                consolidate your wallet and minimize the UTxO and token count.
                <br /> If the error has the additional info "Trade in use", just
                wait until you see the market for a specific SpaceBud has
                updated.
                <br />
                <br /> If all of this doesn't help, please reach out to us on
                Telegram or Discord.
              </div>
            </Disclosure>
          </div>
          <div className="mb-40" />
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQ;
