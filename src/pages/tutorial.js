import React from "react";

import Metadata from "../components/Metadata";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { Box, Link, Grid, GridItem } from "@chakra-ui/layout";

const Tutorial = (props) => {
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
        <Box h="140px" />
        <div
          style={{
            fontSize: 32,
            fontWeight: "bold",
          }}
        >
          How It Works
        </div>
        <Box h={10} />
        <Box
          w={12}
          h={12}
          rounded="full"
          color="white"
          background="purple.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
        >
          1
        </Box>
        <Box h={4} />
        <Box width={370} maxWidth="90%" textAlign="center">
          Get{" "}
          <Link
            href="https://namiwallet.io"
            target="_blank"
            color="purple.500"
            fontWeight="bold"
          >
            Nami Wallet
          </Link>{" "}
          in order to interact with the market place.
        </Box>
        <Box h={4} />
        <Box h={6} w="1px" background="gray.300" />
        <Box h={4} />
        <Box
          w={12}
          h={12}
          rounded="full"
          color="white"
          background="purple.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
        >
          2
        </Box>
        <Box h={4} />
        <Box width={370} maxWidth="90%" textAlign="center">
          Fund the wallet and add collateral (option in Nami).
          <br />
        </Box>
        <Box h={4} />
        <Box h={6} w="1px" background="gray.300" />
        <Box h={4} />
        <Box
          w={12}
          h={12}
          rounded="full"
          color="white"
          background="purple.500"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="bold"
        >
          3
        </Box>
        <Box h={4} />
        <Box width={370} maxWidth="90%" textAlign="center">
          Click on the button at the top right in order to connect the wallet.{" "}
          <Box fontWeight="medium" mt="2">
            Now you are ready!
          </Box>
          <br />
        </Box>
        <Box h={4} />
        <Box textAlign="center" maxWidth="90%">
          The market place consists of these four main functionalities:
        </Box>
        <Box h={6} />
        <Box fontWeight="bold" fontSize="22" color="purple.500">
          Bid
        </Box>
        <Box h={2} />
        <Box width={700} maxWidth="85%">
          Bids can be opened on any SpaceBudz. The bid amount is locked inside
          the contract. The bid amount stays as long in the contract until the
          bid is either accepted, the bid is canceled or someone else overbids
          the current bidder. The current bidder gets automatically refunded.
        </Box>
        <Box h={5} />
        <Box fontWeight="bold" fontSize="22" color="purple.500">
          Offer
        </Box>
        <Box h={2} />
        <Box width={700} maxWidth="85%">
          Offers can be made by the current holders of the SpaceBudz. The
          SpaceBud will be locked inside the contract. The SpaceBud stays as
          long in the contract until the offer is accepted or the the offer is
          canceled.
        </Box>
        <Box h={5} />
        <Box fontWeight="bold" fontSize="22" color="purple.500">
          Buy
        </Box>
        <Box h={2} />
        <Box width={700} maxWidth="85%">
          An offered SpaceBud can be bought. The buyer needs to send the
          requested ADA to the offerer in order to claim the SpaceBud from the
          contract (happens all in the contract transaction of course).
        </Box>
        <Box h={5} />
        <Box fontWeight="bold" fontSize="22" color="purple.500">
          Sell
        </Box>
        <Box h={2} />
        <Box width={700} maxWidth="85%">
          A bid on SpaceBud can be sold by the owner. The seller needs to send
          the right SpaceBud to the bidder in order to claim the ADA amount from
          the contract (happens all in the contract transaction of course).
        </Box>

        <Box h={8} />
        <Box width={700} textAlign="left" fontWeight="bold" fontSize="18">
          Note
        </Box>
        <Box h={2} />
        <Box width={700} maxWidth="85%" fontSize="14">
          We recommend using wallets with not too many tokens and UTxOs. Either
          refactor the wallet or create new accounts in Nami to have the best
          experience possible when interacting with the market place.
        </Box>
        <Box h={20} />
      </div>
    </>
  );
};

export default Tutorial;
