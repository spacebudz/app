import { Grid } from "@geist-ui/react";
import React from "react";
import * as styles from "./Tab.module.css";
import { navigate } from "gatsby";

const Footer = (props) => {
  return (
    <div>
      <div
        style={{
          width: "100%",
          borderTop: "solid #e0e0e0 1.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "40px 20px",
            width: 700,
          }}
        >
          <Grid.Container gap={4} style={{ width: "100%" }}>
            <Grid
              xs={12}
              md={8}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "left",
              }}
            >
              <div>
                {/* <Tab>My Profile</Tab> */}
                <Tab onClick={() => navigate("/explore")}>Explore</Tab>
                <Tab onClick={() => navigate("/tutorial")}>How It Works</Tab>
                <Tab onClick={() => navigate("/FAQ")}>FAQ</Tab>
                <Tab onClick={() => navigate("/about")}>About</Tab>
                <Tab onClick={() => window.open("https://v1.spacebudz.io")}>
                  Go to v1
                </Tab>
              </div>
            </Grid>
            <Grid
              xs={12}
              md={8}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div>
                <Tab
                  onClick={() =>
                    window.open("https://twitter.com/spacebudzNFT")
                  }
                >
                  Twitter
                </Tab>
                <Tab onClick={() => window.open("https://t.me/spacebudz")}>
                  Telegram
                </Tab>
                <Tab
                  onClick={() => window.open("https://discord.gg/ePJZBVwQNq")}
                >
                  Discord
                </Tab>
              </div>
            </Grid>
            <Grid
              xs={24}
              md={8}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <div style={{ zIndex: 1 }}>Powered By</div>
                <img
                  style={{ marginTop: -15 }}
                  src="https://i.pinimg.com/originals/c2/68/87/c26887e96adf4a4a58153a91efcde767.png"
                  width={250}
                ></img>
              </div>
            </Grid>
          </Grid.Container>
        </div>
      </div>
      <div
        style={{
          textAlign: "center",

          marginBottom: 16,
        }}
      >
        <span
          style={{ fontSize: 11, cursor: "pointer" }}
          onClick={() => navigate("/privacyPolicy")}
        >
          Privacy Policy
        </span>
      </div>
    </div>
  );
};

const Tab = (props) => {
  return (
    <div {...props} className={styles.footerTab}>
      {props.children}
    </div>
  );
};

export default Footer;
