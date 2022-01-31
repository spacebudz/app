import React from "react";
import Tab from "./Tab";
import {
  mdiRocketOutline,
  mdiBookOpenOutline,
  mdiSortVariant,
  mdiTwitter,
  mdiTelegram,
  mdiDiscord,
} from "@mdi/js";
import { Popover, Text } from "@geist-ui/react";
import Icon from "@mdi/react";
import { StartButton } from "../Account";
import { navigate } from "gatsby";

import { useBreakpoint } from "gatsby-plugin-breakpoints";

import * as style from "./Tab.module.css";

//assets
import Logo from "../../images/assets/spacebudz.svg";
import Title from "../../images/assets/title.png";
import { Box, Link } from "@chakra-ui/layout";

const Header = () => {
  const matches = useBreakpoint();

  return (
    <div style={{ position: "absolute", width: "100%" }}>
      <div
        id="header"
        style={{
          margin: !matches.md ? "0 4%" : "0 15px",
          height: !matches.md ? 120 : 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
          onClick={() => {
            navigate("/");
            window.scrollTo(0, 0);
          }}
        >
          <img
            style={{
              backgroundColor: "white",
              padding: 2,
              borderRadius: "50%",
            }}
            draggable={false}
            width={!matches.md ? 55 : 45}
            src={Logo}
          />
          {!matches.md && (
            <>
              <Box w={4} />
              <img src={Title} width={140} draggable={false} />
            </>
          )}
        </div>

        {/* Right Side */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            zIndex: 1,
            height: !matches.md ? "65px" : "45px",
            background: "white",
            borderRadius: "40px",
            padding: !matches.md ? "10px 40px" : "5px 10px",
            marginRight: !matches.md && -20,
          }}
        >
          <Tab
            icon={mdiRocketOutline}
            onClick={() => {
              navigate("/explore");
              window.scrollTo(0, 0);
            }}
          >
            Explore
          </Tab>
          <Box w={7} />
          <Tab
            icon={mdiBookOpenOutline}
            menu={(onClose) => (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDir="column"
                p="2"
              >
                <Box
                  color="gray.600"
                  className={style.tabItem}
                  onClick={() => {
                    onClose();
                    navigate("/tutorial");
                  }}
                >
                  How It Works
                </Box>
                <Box w="120%" h="1px" my="2.5" background="gray.200" />
                <Box
                  color="gray.600"
                  className={style.tabItem}
                  onClick={() => {
                    onClose();
                    navigate("/FAQ");
                  }}
                >
                  FAQ
                </Box>
              </Box>
            )}
          >
            Guide
          </Tab>
          <Box w={7} />
          <Tab
            icon={mdiSortVariant}
            menu={(onClose) => (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDir="column"
                p="2"
              >
                <Box className={style.tabItemTitle}>Social media</Box>
                <Box w="120%" h="1px" my="2.5" background="gray.200" />
                <Box
                  w="full"
                  textAlign="left"
                  color="gray.600"
                  className={style.tabItem}
                  onClick={() =>
                    window.open("https://twitter.com/spacebudzNFT")
                  }
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Icon path={mdiTwitter} size={0.7} />{" "}
                  <span style={{ marginLeft: 6 }}>Twitter</span>
                </Box>
                <Box h="2" />
                <Box
                  w="full"
                  textAlign="left"
                  color="gray.600"
                  className={style.tabItem}
                  onClick={() => window.open("https://t.me/spacebudz")}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Icon path={mdiTelegram} size={0.7} />{" "}
                  <span style={{ marginLeft: 6 }}>Telegram</span>
                </Box>
                <Box h="2" />

                <Box
                  w="full"
                  textAlign="left"
                  color="gray.600"
                  className={style.tabItem}
                  onClick={() => window.open("https://discord.gg/aG74bGSYbT")}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Icon path={mdiDiscord} size={0.7} />{" "}
                  <span style={{ marginLeft: 6 }}>Discord</span>
                </Box>
                <Box w="120%" h="1px" my="2.5" background="gray.200" />
                <Box
                  color="gray.600"
                  className={style.tabItem}
                  onClick={() => {
                    onClose();
                    navigate("/about");
                  }}
                >
                  About
                </Box>
              </Box>
            )}
          >
            More
          </Tab>
          <Box w={7} />
          <StartButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
