import { useDisclosure } from "@chakra-ui/hooks";
import React from "react";
import MiddleEllipsis from "react-middle-ellipsis";
import { Button } from "../components/Button";
import { navigate } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import Metadata from "../components/Metadata";
import styled from "styled-components";
import { ShareModal } from "../components/Modal";

//assets
import Show from "../images/assets/show.svg";
import { Share2 } from "@geist-ui/react-icons";
import { Box, Text } from "@chakra-ui/layout";
import { Link } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";

function toHex(str, hex) {
  try {
    hex = unescape(encodeURIComponent(str))
      .split("")
      .map(function (v) {
        return v.charCodeAt(0).toString(16);
      })
      .join("");
  } catch (e) {
    hex = str;
  }
  return hex;
}

const SpaceBud = ({ pageContext: { spacebud } }) => {
  const matches = useBreakpoint();
  const [owner, setOwner] = React.useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const POLICY = "d5e6bf0500378d4f0da4e8dde6becec7621cd8cbf5cbb9b87013d4cc";

  const fetchData = async () => {
    const token = POLICY + toHex(`SpaceBud${spacebud.id}`);
    const addresses = await fetch(
      `https://cardano-mainnet.blockfrost.io/api/v0/assets/${token}/addresses`,
      { headers: { project_id: "3Ojodngr06BReeSN9lhsow0hypKf8gu5" } }
    ).then((res) => res.json());
    setOwner(addresses);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title={"SpaceBudz | SpaceBud #" + spacebud.id}
        description={`SpaceBud #${spacebud.id}`}
        image={spacebud.image}
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          marginTop: 150,
          marginBottom: 100,
        }}
      >
        <div
          style={{
            position: "relative",
            paddingBottom: 35,
            width: "95%",
            borderRadius: 10,
            backgroundImage: `url(${Show})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "white",
          }}
        >
          <div
            style={{
              zIndex: 10,
              position: "absolute",
              left: 25,
              top: 25,
              cursor: "pointer",
            }}
            onClick={() => onOpen()}
          >
            <Share2 size={26} />
          </div>
          {/* Modal Share */}
          <ShareModal
            bud={spacebud}
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
          />
          {/* Modal Share End */}
          <div
            style={{
              width: !matches.md ? 410 : 350,
              height: !matches.md ? 410 : 350,
              borderRadius: "50%",
              marginTop: -15,
              marginBottom: -50,
              // backgroundColor: "white",
            }}
          >
            <div style={{ width: "100%", position: "relative" }}>
              {owner.length >= 2 && (
                <img
                  src={spacebud.image}
                  style={{
                    position: "absolute",
                    left: 20,
                    top: -12,
                    filter: "brightness(0.7)",
                  }}
                  width="100%"
                />
              )}
              <img
                src={spacebud.image}
                style={{ position: "absolute" }}
                width="100%"
              />
            </div>
          </div>
          <Box h={5} />
          <div style={{ fontWeight: 600, fontSize: 30 }}>
            SpaceBud #{spacebud.id}
          </div>

          <LinkName onClick={() => navigate(`/explore/?type=${spacebud.type}`)}>
            {spacebud.type} Astronaut
          </LinkName>
        </div>
        <Box h={6} />
        {owner.length >= 2 && (
          <>
            <div
              style={{
                fontWeight: 600,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div style={{ marginTop: -5 }}>Twin</div>
              <Box w={2} />
            </div>{" "}
            <Box h={3} />
          </>
        )}
        {owner.length > 0 ? (
          owner.map((item, i) => (
            <div
              key={i}
              style={{
                marginBottom: 5,
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                border: "solid 2px #311b92",
                borderRadius: 25,
                color: "#777777",
              }}
            >
              <span>
                <b>Owner:</b>{" "}
              </span>
              <div
                style={{
                  width: "200px",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                <MiddleEllipsis>
                  <Link
                    underline
                    color="purple.600"
                    onClick={(e) => {
                      if (owner) navigate(`/profile?address=${item.address}`);
                    }}
                  >
                    {item.address}
                  </Link>
                </MiddleEllipsis>
              </div>
            </div>
          ))
        ) : (
          <>
            <Box h={3} />
            <Box display="flex">
              <Text color="GrayText" mr="3">
                Owner
              </Text>{" "}
              <BeatLoader size="5" color="#6B46C1" />
            </Box>
          </>
        )}

        <Box h={12} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              zIndex: 1,
              fontSize: 18,
              fontWeight: 800,
              background: "black",
              color: "white",
              padding: "3px 8px",
              borderRadius: 20,
              transform: "rotate(-5deg)",
            }}
          >
            Trading coming soon
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.3 }}>Buy now price</div>
            <div style={{ fontWeight: 500, opacity: 0.3 }}>100.0 ADA</div>
            <div style={{ fontSize: 12, color: "#777777", opacity: 0.3 }}>
              10.8 USD
            </div>
          </div>
          <Box w={4} />
          <Button style={{ opacity: 0.3 }}>Buy</Button>
          <Box w={2} />
          <Button style={{ opacity: 0.3 }} bgcolor="#263238">
            Make Offer
          </Button>
        </div>
        <Box h={10} />
        <div style={{ fontSize: 26, color: "#777777", fontWeight: 600 }}>
          Gadgets
        </div>
        <Box h={3} />
        <div
          style={{
            width: 250,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {spacebud.gadgets.length > 0 ? (
              spacebud.gadgets.map((gadget, index) => (
                <Box p="1">
                  <Attribute
                    key={index}
                    onClick={() => navigate(`/explore/?gadget=${gadget}`)}
                  >
                    {gadget}
                  </Attribute>
                </Box>
              ))
            ) : (
              <div style={{ fontSize: 14, opacity: 0.3 }}>No Gadgets</div>
            )}
          </Box>
        </div>
      </div>
    </>
  );
};

const LinkName = styled.span`
  cursor: pointer;
  color: white;
  &:hover {
    text-decoration: underline;
  }
`;

const Attribute = (props) => {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <LinkName onClick={() => props.onClick()}>
        <div
          style={{
            display: "table",
            height: 20,
            backgroundColor: "#9575cd",
            padding: "3px 6px",
            borderRadius: 25,
            fontSize: 14,
            color: "white",
            fontWeight: 500,
            textAlign: "center",
            verticalAlign: "middle",
          }}
        >
          {props.children}
        </div>
      </LinkName>
    </Box>
  );
};

export default SpaceBud;
