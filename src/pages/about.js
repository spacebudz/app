import React from "react";
import { LaunchButton } from "../components/Button";
import { Grid, Link, Spacer } from "@geist-ui/react";

import Layout from "../templates/layout";
import Metadata from "../components/Metadata";
import { useBreakpoint } from "gatsby-plugin-breakpoints";

//assets
import TeamImage from "../images/assets/team.png";

const About = (props) => {
  const matches = useBreakpoint();

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <Layout>
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
            <Spacer y={1} />
            <div>
              Hey there, we are two crypto enthusiast, who found the true
              potential of Cardano.
              <br /> I'm Alessandro and I operate the Cardano stake pool Berry.
              And I'm Zieg, NFT-enthousiast since claiming his first cryptopunk
              in 2017!
            </div>
            <Spacer y={1} />
            <img src={TeamImage} />
            <Spacer y={2} />
            <div
              style={{
                fontSize: 32,
              }}
            >
              Token Policy
            </div>
            <Spacer y={1} />
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
                </Link>{" "}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default About;
