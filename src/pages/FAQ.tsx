import * as React from "react";
import { Disclosure } from "../components";
import { NEBULA_HASH, POLICY_ID } from "../config";
import { MainLayout } from "../layouts/mainLayout";

const FAQ = () => {
  return (
    <MainLayout title="SpaceBudz | FAQ" titleTwitter="SpaceBudz: FAQ">
      <div className="w-full flex justify-center items-center">
        <div className="px-8 mt-4 md:mt-0 max-w-5xl w-full">
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
                  className="text-purple-500 font-semibold"
                  href="https://namiwallet.io"
                  target="_blank"
                >
                  Nami
                </a>
                ,{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/flint-wallet/hnhobjmcibchnmglfbldbfabcgaknlkj"
                  target="_blank"
                >
                  Flint
                </a>{" "}
                ,{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/ccvaultio/kmhcihpebfmpgmihbkipmjlmmioameka"
                  target="_blank"
                >
                  eternl
                </a>{" "}
                ,{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/typhon-wallet/kfdniefadaanbjodldohaedphafoffoh"
                  target="_blank"
                >
                  Typon
                </a>{" "}
                ,{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/begin-wallet/nhbicdelgedinnbcidconlnfeionhbml"
                  target="_blank"
                >
                  Begin
                </a>{" "}
                ,{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/nufi/gpnihlnnodeiiaakbikldcihojploeca"
                  target="_blank"
                >
                  NuFi
                </a>{" "}
                ,{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/cwallet/apnehcjmnengpnmccpaibjmhhoadaico"
                  target="_blank"
                >
                  CWallet
                </a>{" "}
                and{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://chrome.google.com/webstore/detail/gerowallet/bgpipimickeadkjlklgciifhnalhdjhe"
                  target="_blank"
                >
                  Gero
                </a>
                .
              </div>
            </Disclosure>
            <Disclosure
              title="What is the policy id of SpaceBudz"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                The policy id is based on a plutus contract. You can find the
                source code{" "}
                <a
                  className="text-purple-500 font-semibold break-words"
                  href="https://github.com/spacebudz/wormhole"
                  target="_blank"
                >
                  here
                </a>
                .
                <br />
                <br />
                The policy id:
                <br />
                <a
                  className="text-purple-500 font-semibold break-all"
                  href={`https://cardanoscan.io/tokenPolicy/${POLICY_ID}`}
                  target="_blank"
                >
                  {POLICY_ID}
                </a>
              </div>
            </Disclosure>
            <Disclosure
              title="What is the wormhole"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                The wormhole is a migration contract for SpaceBudz to move the
                NFTs from{" "}
                <a
                  className="text-purple-500 font-semibold break-words"
                  href="https://github.com/cardano-foundation/CIPs/tree/master/CIP-0025"
                  target="_blank"
                >
                  CIP-0025
                </a>{" "}
                to{" "}
                <a
                  className="text-purple-500 font-semibold break-words"
                  href="https://github.com/cardano-foundation/CIPs/tree/master/CIP-0068"
                  target="_blank"
                >
                  CIP-0068
                </a>{" "}
                with enhanced functionality.
                <br />
                In order to migrate SpaceBudz connect your wallet and go to your
                profile. You will see migration buttons appear above the
                SpaceBudz that need to be migrated. <br /> The old policy id is
                deprecated and no longer associated with SpaceBudz.
                <br />
              </div>
            </Disclosure>
            <Disclosure
              title="Does the marketplace use smart contracts"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                Yes the marketplace is fully contract based and uses the{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://github.com/spacebudz/nebula"
                  target="_blank"
                >
                  Nebula protocol
                </a>
                . There is no 3rd party or middleman involved.
                <br /> The contract hash:{" "}
                <span className="font-semibold break-all">{NEBULA_HASH}</span>
                <br />
                <br />
                The full source code can be found{" "}
                <a
                  className="text-purple-500 font-semibold"
                  href="https://github.com/spacebudz/nebula"
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
                <div className="mt-6">
                  The SpaceBudz marketplace currently uses only a subset of
                  features that are availabe in Nebula.
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
              title="What fees are involved in the marketplace"
              className="mt-4 min-h-[2.75rem] !h-auto"
              classNameInner="min-h-[2.75.rem] !h-auto"
              theme="white"
            >
              <div className="px-4 pb-4">
                Besides Cardano network fees, the marketplace charges a 2.4%
                service fee.
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
