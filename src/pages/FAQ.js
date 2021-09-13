import React from "react";

import Metadata from "../components/Metadata";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Link,
} from "@chakra-ui/react";

//assets
import { navigate } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { Box } from "@chakra-ui/layout";

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
        <Box h="28" />
        <div
          style={{
            fontSize: 32,
          }}
        >
          FAQ
        </div>
        <Box h={10} />
        <div style={{ width: "90%", maxWidth: 900 }}>
          <Accordion allowMultiple>
            <AccordionItem>
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    Which wallet can I use?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  <Link href="https://yoroi-wallet.com/#/">Yoroi</Link>
                  <br />
                  <Link href="https://daedaluswallet.io/">Daedalus</Link>
                  <br />
                  <Link href="https://adalite.io/">AdaLite</Link> (Hardware
                  wallet recommended)
                  <br />
                  <br />
                  <b>Never send ADA from an exchange!</b>
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    Tokens without Smart Contracts, how?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  Cardano is different from many other blockchains out there.
                  Instead of using smart contracts to create your ERC20 or
                  ERC721 token, tokens on Cardano are native. They are treated
                  like as ADA. Since the Mary Hard Fork tokens on Cardano are
                  real!
                </Text>
              </AccordionPanel>
            </AccordionItem>{" "}
            <AccordionItem>
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    Where are the metadata?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  The metadata for each token are on-chain. The metadata itself
                  links to an image on IPFS and Arweave in order to keep the
                  data immutable and retrievable forever. The metadata are in
                  the minting transaction of the token. Check out this{" "}
                  <a
                    href="https://cardanoscan.io/transaction/c8671bf7fe1cd75c8a387822b84c8e4f5fe61043c60618dc9ad68d6ebcd12c7f?tab=metadata"
                    target="_blank"
                  >
                    example
                  </a>
                  . Scroll down to the metadata and click on them to see them.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    Is this actually an NFT?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  These tokens are unique forever in the future. The minting
                  policy is time based. After a certain period of time there is
                  no way to mint or burn anymore. So you as owner of a token can
                  be ensured it is forever staying at quantity 1 and no one can
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
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    When trading?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  We have to wait until smart contacts to launch on Cardano. In
                  Q2 we should see that. But you already have the ability to
                  send tokens freely around.
                </Text>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};

export default FAQ;
