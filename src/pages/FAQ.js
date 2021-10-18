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
        <Box h="200px" />
        <div
          style={{
            fontSize: 32,
            fontWeight: "bold",
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
                <Text fontSize="sm">
                  <Link
                    href="https://namiwallet.io"
                    color="teal.400"
                    fontWeight="bold"
                  >
                    Nami
                  </Link>{" "}
                  is the only wallet that supports smart contract functionality
                  at the moment. More wallets may be supported in the future.
                </Text>
              </AccordionPanel>
            </AccordionItem>
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
                <Text fontSize="sm">
                  The metadata for each token are on-chain and follow{" "}
                  <Link
                    color="purple.500"
                    href="https://github.com/cardano-foundation/CIPs/blob/master/CIP-0025/CIP-0025.md"
                    target="_blank"
                  >
                    CIP-25
                  </Link>
                  , which was proposed by SpaceBudz and is now used in the
                  majority of NFT projects. The metadata itself links to an
                  image on IPFS and Arweave in order to keep the data immutable
                  and retrievable forever. The metadata are in the minting
                  transaction of the token. Check out this{" "}
                  <Link
                    color="purple.500"
                    href="https://cardanoscan.io/transaction/c8671bf7fe1cd75c8a387822b84c8e4f5fe61043c60618dc9ad68d6ebcd12c7f?tab=metadata"
                    target="_blank"
                  >
                    example
                  </Link>
                  . Scroll down to the metadata and click on it to view more.
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
                <Text fontSize="sm">
                  These tokens are unique forever. The minting policy is time
                  based and closed on the 22nd of August 2021.
                  <br /> The minting script:
                  <Box fontWeight="medium" my={4}>
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
                  </Box>
                  Hash it and you get the following Policy ID:
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
                    Does the market place use smart contracts?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text fontSize="sm">
                  Yes the market place is fully based on a contract. There is no
                  3rd party or middleman involved.
                  <br /> The contract address:{" "}
                  <Link
                    href="https://cardanoscan.io/address/addr1wyzynye0nksztrfzpsulsq7whr3vgh7uvp0gm4p0x42ckkqqq6kxq"
                    target="_blank"
                  >
                    addr1wyzynye0nksztrfzpsulsq7whr3vgh7uvp0gm4p0x42ckkqqq6kxq
                  </Link>
                  <br />
                  <br />
                  The full source code you can find{" "}
                  <Link
                    color="purple.500"
                    href="https://github.com/Berry-Pool/spacebudz"
                    target="_blank"
                  >
                    here
                  </Link>
                  .
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem fontSize="sm">
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    Is my bid or offer locked in the contract?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  Yes it is locked in the contract, but you can always cancel
                  the bid/offer and reclaim your funds. But a buyer/seller has
                  of course always the opportunity to accept your bid/offer as
                  long as your funds are in the contract.
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem fontSize="sm">
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    What fees are involved in the market place?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  Besides Cardano network fees, the market place charges a 2.4%
                  service fee. 0.4% of it are available to market place hosting
                  providers. Find out more about it{" "}
                  <Link
                    color="purple.500"
                    href="https://github.com/Berry-Pool/spacebudz/tree/main/src/cardano/market"
                    target="_blank"
                  >
                    here
                  </Link>
                  .
                </Text>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem fontSize="sm">
              <h2>
                <AccordionButton rounded="md" _hover={{}}>
                  <Box flex="1" textAlign="left">
                    I get the error: Transaction not possible
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel>
                <Text>
                  Make sure you have enough funds to cover your trade. Try to
                  refactor your wallet and minimize the UTxO and token count.
                  <br /> If the error has the additional info "Trade in use",
                  just wait until you see the market for a specific SpaceBud has
                  updated.
                  <br />
                  <br /> If all of this doesn't help, please reach out to us on
                  Telegram or Discord.
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
