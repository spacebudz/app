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
            }}
          >
            About Us
          </div>
          <Box h={3} />
          <div>
            Hey there, we are two crypto enthusiast, who found the true
            potential of Cardano.
            <br /> I'm Alessandro and I operate the Cardano stake pool Berry.
            And I'm Zieg, NFT-enthusiast since claiming my first CrypoPunk in
            2017!
          </div>
          <Box h={3} />
          <img src={TeamImage} />
          <Box h={5} />
          <div
            style={{
              fontSize: 32,
            }}
          >
            Token Policy
          </div>
          <Box h={3} />
          <div>
            In order to verify the validity of your SpaceBud, check if its
            Policy Id matches the following.
            <p style={{ wordBreak: "break-all" }}>
              <b>Policy Id: </b>
              d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc
            </p>
            <p>
              Find out more about the Policy Id{" "}
              <Link
                style={{ textDecoration: "underline" }}
                href="https://github.com/alessandrokonrad/spacebudz"
                target="_blank"
                underline
              >
                here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
