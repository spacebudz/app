import React from "react";
import { LaunchButton } from "../components/Button";
import Metadata from "../components/Metadata";

//assets
import BuySellIcon from "../images/assets/buysell.svg";
import CollectHoldIcon from "../images/assets/collecthold.svg";
import ShareGiftIcon from "../images/assets/sharegift.svg";
import BudRepresent from "../images/assets/spacebud.svg";
import { navigate } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { graphql, useStaticQuery } from "gatsby";
import BackgroundImage from "gatsby-background-image";
import styled from "styled-components";
import Icon from "@mdi/react";
import { mdiDiscord, mdiTelegram, mdiTwitter } from "@mdi/js";
import { Box, SimpleGrid } from "@chakra-ui/layout";

const Landing = (props) => {
  const matches = useBreakpoint();

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <div>
        <Background>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                marginTop: !matches.md ? "20%" : 140,
                marginLeft: !matches.md && 70,
                display: "flex",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <SimpleGrid columns={[1, null, 2]} style={{ width: "90%" }}>
                  <Box></Box>
                  <Box
                    style={{
                      maxWidth: 600,
                      background: "white",
                      padding: 30,
                      borderRadius: 16,
                      marginBottom: !matches.md && "30px",
                      position: "relative",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: !matches.md ? 34 : 30,
                          fontWeight: 800,
                          color: "#311b92",
                          lineHeight: 1.3,
                        }}
                      >
                        Collect your favorite astronauts!
                      </div>
                      <Box h={6} />
                      <div
                        style={{
                          color: "black",
                          maxWidth: 350,
                          fontSize: 14,
                        }}
                      >
                        <SimpleGrid columns={[2]} gap={3}>
                          <Box>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <img src={BuySellIcon} width={30}></img>
                              <Box w={4} />
                              <div>Buy & Sell</div>
                            </div>
                          </Box>
                          <Box xs={12}>
                            {" "}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <img src={CollectHoldIcon} width={30}></img>

                              <Box w={4} />
                              <div>Collect & Hold</div>
                            </div>
                          </Box>
                          <Box xs={12}>
                            {" "}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <img src={ShareGiftIcon} width={30}></img>

                              <Box w={4} />
                              <div>Share & Gift</div>
                            </div>
                          </Box>
                          <Box xs={12}></Box>
                        </SimpleGrid>
                      </div>
                      <Box h={5} />
                      <div
                        style={{
                          maxWidth: 500,
                          fontSize: 18,
                          color: "#82817D",
                          fontWeight: "bold",
                        }}
                      >
                        10,000 SpaceBudz are out there. Where will your
                        SpaceBudz take you?
                      </div>
                      <Box h={8} />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: -25,
                      }}
                    >
                      <LaunchButton
                        onClick={() => {
                          navigate("/explore");
                        }}
                      />
                    </div>
                  </Box>
                </SimpleGrid>
              </div>
            </div>
          </div>
        </Background>
        <Box h={20} />
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {/* What is SpaceBudz */}
          <div
            style={{
              maxWidth: 800,
              width: "90%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={BudRepresent} width="20%" style={{ minWidth: 100 }} />
            <Box w={10} />
            <div>
              <div style={{ fontSize: 32 }}>What is SpaceBudz?</div>
              <Box h={4} />
              <div
                style={{
                  fontWeight: 350,
                  maxWidth: 500,
                  lineHeight: 1.8,
                  fontSize: 17,
                }}
              >
                SpaceBudz is an NFT platform on the Cardano blockchain. 10,000
                SpaceBudz are in existence and each astronaut is unique and only
                owned by you. Animals, robots and other mysterious creatures
                with different features and properties await you!
              </div>
            </div>
          </div>
          {/* Why */}
          <Box h={20} />
          <div style={{ fontSize: 32 }}>Why get a SpaceBud?</div>
          <Box h={3} />
          <div
            style={{
              textAlign: "center",
              fontWeight: 350,
              maxWidth: 600,
              width: "90%",
              fontSize: 17,
              lineHeight: 1.8,
            }}
          >
            NFTs fundamentally change how people can collect and trade art. We
            strongly believe that it's here to stay. Everyone can build up a
            digital collection and share it with others. SpaceBudz leverages
            this experience with the use of the Cardano multi asset ledger.
          </div>

          {/* Contact */}
          <Box h={20} />
          <div style={{ fontSize: 32 }}>Still clueless?</div>
          <Box h={3} />
          <div style={{ fontWeight: "350" }}>Reach out to us on</div>
          <Box h={4} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#777777",
            }}
          >
            <Icon
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://twitter.com/spacebudzNFT")}
              path={mdiTwitter}
              size={1.2}
            />
            <Box w={5} />
            <Icon
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://t.me/spacebudz")}
              path={mdiTelegram}
              size={1.2}
            />
            <Box w={5} />

            <Icon
              style={{ cursor: "pointer" }}
              onClick={() => window.open("https://discord.gg/ePJZBVwQNq")}
              path={mdiDiscord}
              size={1.2}
            />
          </div>
        </div>
        <Box h={20} />
      </div>
    </>
  );
};

const BackgroundSection = (props) => {
  const data = useStaticQuery(
    graphql`
      query {
        desktop: file(relativePath: { eq: "assets/wallpaper.png" }) {
          childImageSharp {
            fluid(quality: 100, maxWidth: 10000) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
    `
  );
  // Set ImageData.
  const imageData = data.desktop.childImageSharp.fluid;

  return (
    <BackgroundImage
      className={props.className}
      fluid={imageData}
      backgroundColor={`#040e18`}
    >
      {props.children}
    </BackgroundImage>
  );
};

const Background = styled(BackgroundSection)`
  width: 100%;
  min-height: 100vh;
  background-repeat: no-repeat;
  background-size: cover;
`;

export default Landing;
