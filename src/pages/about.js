import React from "react";

import Metadata from "../components/Metadata";
import { Box, Link } from "@chakra-ui/layout";

//assets
import TeamImage from "../images/assets/team.png";

const About = () => {
  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            marginTop: 150,
            width: "90%",
            maxWidth: 700,
          }}
        >
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            About Us
          </div>
          <Box h={3} />
          <div>
            Hey there, we are two crypto enthusiast, who found the true
            potential of Cardano.
            <br /> I'm Alessandro, operator of Berry Pool and creator of Nami
            Wallet. And I'm Zieg, NFT-enthusiast since claiming my first
            CryptoPunk in 2017!
          </div>
          <Box h={3} />
          <img src={TeamImage} />
          <Box h={5} />
          <div
            style={{
              fontSize: 32,
              fontWeight: "bold",
            }}
          >
            Token Policy
          </div>
          <Box h={3} />
          <div>
            In order to verify the validity of your SpaceBud, check if the
            Policy ID matches: <br />
            <Box mt={2} mb={3}>
              <Link
                href="https://cardanoscan.io/tokenPolicy/d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc"
                target="_blank"
                wordBreak="break-all"
                fontWeight="medium"
              >
                d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc
              </Link>
            </Box>
            <p>
              Find out more about the Policy ID{" "}
              <Link
                style={{ textDecoration: "underline" }}
                href="https://github.com/Berry-Pool/spacebudz"
                target="_blank"
                underline
              >
                here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
