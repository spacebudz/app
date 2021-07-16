import React from "react";
import { LaunchButton } from "../components/Button";
import { Collapse, Grid, Spacer, Text } from "@geist-ui/react";

import Layout from "../templates/layout";
import Metadata from "../components/Metadata";

//assets
import BudRepresent from "../images/assets/spacebud.svg";
import { Link, navigate } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";

const FAQ = (props) => {
  const matches = useBreakpoint();

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Spacer y={7} />
        <div
          style={{
            fontSize: 32,
          }}
        >
          FAQ
        </div>
        <Spacer y={2} />
        <div style={{ width: "90%", maxWidth: 900 }}>
          <Collapse.Group>
            <Collapse title="Which wallet can I use?">
              <Text>
                <Link href="https://yoroi-wallet.com/#/">Yoroi</Link>
                <br />
                <Link href="https://daedaluswallet.io/">Daedalus</Link>
                <br />
                <Link href="https://adalite.io/">AdaLite</Link> (Hardware wallet
                recommended)
                <br />
                <br />
                <b>Never send ADA from an exchange!</b>
              </Text>
            </Collapse>
            <Collapse title="Tokens without Smart Contracts, how?">
              <Text>
                Cardano is different from many other blockchains out there.
                Instead of using smart contracts to create your ERC20 or ERC721
                token, tokens on Cardano are native. They are treated like as
                ADA. Since the Mary Hard Fork tokens on Cardano are real!
              </Text>
            </Collapse>
            <Collapse title="Where are the metadata?">
              <Text>
                The metadata for each token are on-chain. The metadata itself
                links to an image on IPFS and Arweave in order to keep the data
                immutable and retrievable forever. The metadata are in the
                minting transaction of the token. Check out this{" "}
                <a
                  href="https://cardanoscan.io/transaction/c8671bf7fe1cd75c8a387822b84c8e4f5fe61043c60618dc9ad68d6ebcd12c7f?tab=metadata"
                  target="_blank"
                >
                  example
                </a>
                . Scroll down to the metadata and click on them to see them.
              </Text>
            </Collapse>
            <Collapse title="Is this actually an NFT?">
              <Text>
                These tokens are unique forever in the future. The minting
                policy is time based. After a certain period of time there is no
                way to mint or burn anymore. So you as owner of a token can be
                ensured it is forever staying at quantity 1 and no one can
                influence that. This is what makes a token an NFT.
                <br /> The minting script:
                <p style={{ fontSize: 15 }}>
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
                </p>
                Hash it and you get the following Policy Id:
                <br />
                <Link
                  href="https://cardanoscan.io/tokenPolicy/d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc"
                  target="_blank"
                >
                  d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc
                </Link>
              </Text>
            </Collapse>
            <Collapse title="When trading?">
              <Text>
                We have to wait until smart contacts to launch on Cardano. In Q2
                we should see that. But you already have the ability to send
                tokens freely around.
              </Text>
            </Collapse>
          </Collapse.Group>
        </div>
      </div>
    </>
  );
};

export default FAQ;
