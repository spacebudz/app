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
import { Spacer, Popover, Link } from "@geist-ui/react";
import Icon from "@mdi/react";
import { StartButton } from "../Account";
import { navigate } from "gatsby";

import { useBreakpoint } from "gatsby-plugin-breakpoints";

//assets
import Logo from "../../images/assets/logo3.svg";
import Title from "../../images/assets/title.png";

const Header = (props) => {
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
              <Spacer x={0.8} />
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
          <Spacer x={1.2} />
          <Tab
            icon={mdiBookOpenOutline}
            menu={
              <>
                <Popover.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/tutorial")}
                >
                  <span>How It Works</span>
                </Popover.Item>
                <Popover.Item line />
                <Popover.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/FAQ")}
                >
                  <span>FAQ</span>
                </Popover.Item>
              </>
            }
          >
            Guide
          </Tab>
          <Spacer x={1.2} />
          <Tab
            icon={mdiSortVariant}
            menu={
              <>
                <Popover.Item title>
                  <span>Social Media</span>
                </Popover.Item>
                <Popover.Item>
                  <Link
                    href="https://twitter.com/spacebudzNFT"
                    target="_blank"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon path={mdiTwitter} size={0.7} />{" "}
                    <span style={{ marginLeft: 4 }}>Twitter</span>
                  </Link>
                </Popover.Item>
                <Popover.Item>
                  <Link
                    href="https://t.me/spacebudz"
                    target="_blank"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon path={mdiTelegram} size={0.7} />{" "}
                    <span style={{ marginLeft: 4 }}>Telegram</span>
                  </Link>
                </Popover.Item>
                <Popover.Item>
                  <Link
                    href="https://discord.gg/ePJZBVwQNq"
                    target="_blank"
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <Icon path={mdiDiscord} size={0.7} />{" "}
                    <span style={{ marginLeft: 4 }}>Discord</span>
                  </Link>
                </Popover.Item>
                <Popover.Item line />
                <Popover.Item
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/about")}
                >
                  <span>About</span>
                </Popover.Item>
              </>
            }
          >
            More
          </Tab>
          <Spacer x={1.5} />
          <StartButton />
        </div>
      </div>
    </div>
  );
};

export default Header;
