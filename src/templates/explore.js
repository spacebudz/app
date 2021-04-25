import React from "react";
import Headroom from "react-headroom";
import { Search, setFilter } from "../components/Filter";
import InfiniteGrid from "../components/InfiniteGrid";
import {
  ButtonGroup,
  Button as GButton,
  Grid,
  Loading,
  Spacer,
  useModal,
  Badge,
} from "@geist-ui/react";
import { FloatingButton } from "../components/Button";
import { Filter } from "@geist-ui/react-icons";
import { FilterModal } from "../components/Filter";

import Layout from "./layout";
import Metadata from "../components/Metadata";

let fullList = [];
let recentSearch;
let filterInterval;

function hex2a(hexx) {
  var hex = hexx.split("\\x")[1].toString(); //force conversion
  var str = "";
  for (var i = 0; i < hex.length && hex.substr(i, 2) !== "00"; i += 2)
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Explore = ({ pageContext: { spacebudz }, location }) => {
  // const fullList = spacebudz.map((bud) => ({ ...bud }));

  // const [array, setArray] = React.useState(fullList);
  const [array, setArray] = React.useState([]);
  const [filters, setFilters] = React.useState({
    // price: null,
    // search: null,
    // forSale: false,
  });
  const [param, setParam] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const { visible, setVisible, bindings } = useModal();

  const setColor = (order, up = true) => {
    if (order == null) return "#b5b5b5";
    if (order == "ASC" && up) return "black";
    if (order == "ASC" && !up) return "#b5b5b5";
    if (order == "DESC" && up) return "#b5b5b5";
    if (order == "DESC" && !up) return "black";
  };

  const numberOfAppliedFilter = () => {
    const f = filters;
    let count = 0;
    if (f.id || f.id == 0) count += 1;
    if (f.types) f.types.forEach(() => (count += 1));
    if (f.gadgets) f.gadgets.forEach(() => (count += 1));
    if (f.range && f.range.length > 0) count += 1;
    if (f.gadgetsCount) count += 1;
    return count;
  };

  const applySearch = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const types = urlParams.getAll("type");
    const gadgets = urlParams.getAll("gadget");
    const range = urlParams.getAll("range");
    const gadgetsCount = urlParams.get("gadgetsCount");
    const searchString = (
      id +
      types +
      gadgets +
      range +
      gadgetsCount
    ).toString();
    if (searchString == recentSearch) return;
    recentSearch = searchString;
    setLoading(true);
    if (
      id ||
      id == 0 ||
      types.length > 0 ||
      gadgets.length > 0 ||
      range.length > 0 ||
      gadgetsCount
    ) {
      if (id || id == 0) setParam(id);
      await sleep();
      const f = filters;
      f.id = id;
      f.types = types;
      f.gadgets = gadgets;
      f.range = range;
      f.gadgetsCount = gadgetsCount;
      const filtered = await setFilter(fullList, f);
      setArray(null);
      setTimeout(() => setArray(filtered));
      setFilters(f);
    } else {
      setParam("");
      setArray(fullList);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    const API = "https://us-central1-space-budz.cloudfunctions.net/api";
    let tokens = await fetch(API + "/minted").then((res) => res.json());
    tokens = tokens.minted.map((id) => spacebudz[id]);

    fullList = tokens;
    setLoading(false);
    filterInterval = setInterval(() => {
      applySearch();
    });
  };

  React.useEffect(() => {
    fetchData();
    return () => {
      recentSearch = "";
      clearInterval(filterInterval);
    };
  }, []);

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz | Explore"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <Layout>
        <div
          style={{
            position: "relative",
            width: "100%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            marginTop: 110,
          }}
        >
          <FloatingButton onClick={() => window.scrollTo(0, 0)} />

          <div
            style={{
              width: "100%",
              maxWidth: 1400,
            }}
          >
            <Headroom style={{ zIndex: 2 }}>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    marginBottom: 20,
                    marginTop: 20,
                    width: "85%",
                    maxWidth: 310,
                  }}
                >
                  <Search
                    param={param}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        window.scrollTo(0, 0);
                        if (e.target.value == "") return;
                        window.history.pushState(
                          {},
                          null,
                          `/explore/?id=${e.target.value}`
                        );
                      }
                    }}
                    onSearch={(e) => {
                      window.scrollTo(0, 0);

                      if (e == "") return;
                      window.history.pushState({}, null, `/explore/?id=${e}`);
                    }}
                    onChange={(e) => {
                      if (e.target.value) e.persist();
                      if (
                        e.target.value == "" &&
                        array.toString() != fullList
                      ) {
                        window.history.pushState({}, null, `/explore/`);
                        return;
                      }
                    }}
                  />
                  <Spacer y={0.8} />
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ButtonGroup
                      style={{
                        borderRadius: 16,
                        overflow: "visible",
                        border: "none",
                      }}
                      type="success"
                    >
                      <Badge.Anchor>
                        {array &&
                          array.length < fullList.length &&
                          !filters.id && (
                            <Badge type="warning">
                              {numberOfAppliedFilter()}
                            </Badge>
                          )}
                        <GButton
                          icon={<Filter />}
                          effect={false}
                          onClick={() => setVisible(true)}
                        >
                          {array &&
                          array.length < fullList.length &&
                          !filters.id
                            ? "Change Filter"
                            : "Apply Filter"}
                        </GButton>
                      </Badge.Anchor>

                      <GButton
                        effect={false}
                        onClick={() =>
                          window.history.pushState({}, null, `/explore/`)
                        }
                      >
                        Clear
                      </GButton>
                    </ButtonGroup>
                  </div>
                </div>
              </div>
            </Headroom>
            <div>
              <Spacer y={0.8} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Grid.Container
                  gap={1}
                  style={{ width: "100%", maxWidth: 550 }}
                >
                  <Grid xs={24} md={12}>
                    <div
                      style={{
                        textAlign: "center",
                      }}
                    >
                      <b style={{ fontSize: 16, color: "#777777" }}>
                        Total SpaceBudz:
                      </b>{" "}
                      {fullList.length.toLocaleString()} / 10,000
                    </div>
                  </Grid>
                  <Grid xs={24} md={12}>
                    <div
                      style={{
                        display: "flex",
                        // alignItems: "center",
                        // justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ width: "100%" }}>
                        <b style={{ color: "#777777", fontSize: 16 }}>
                          Result:{" "}
                        </b>
                        {array ? array.length.toLocaleString() : 0}
                      </div>
                      {/* <div style={{ width: "100%", textAlign: "end" }}>
                        <Checkbox
                          onChange={(e) => {
                            const f = filters;
                            f.forSale = e.target.checked;
                            setFilter(fullList, setArray, f);
                            setFilters(f);
                          }}
                        >
                          <b style={{ fontSize: 16 }}>For Sale</b>
                        </Checkbox>
                      </div>
                      <div style={{ width: 20 }} />
                      <div
                        style={{
                          width: "100%",
                          // display: "flex",
                          // alignItems: "center",
                          // justifyContent: "center",
                        }}
                      >
                        <div
                          onClick={() => {
                            const f = filters;
                            f.price = filters.price
                              ? filters.price == "ASC"
                                ? "DESC"
                                : null
                              : "ASC";
                            setFilter(fullList, setArray, f);
                            setFilters(f);
                          }}
                          style={{
                            display: "flex",
                            cursor: "pointer",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            {" "}
                            <ChevronUp
                              size={18}
                              color={setColor(filters.price)}
                            />
                            <div style={{ marginBottom: -10 }} />
                            <ChevronDown
                              size={18}
                              color={setColor(filters.price, false)}
                            />
                          </div>
                          <div style={{ width: 3 }} />
                          <b style={{ fontSize: 16 }}>Price</b>
                        </div>
                        </div> */}
                    </div>
                  </Grid>
                </Grid.Container>
              </div>
            </div>
            <Spacer y={3} />
            <div
              style={{
                marginBottom: 100,
              }}
            >
              {loading ? (
                <Loading size="large" type="success" />
              ) : (
                array && <InfiniteGrid array={array} spacebudz={spacebudz} />
              )}
            </div>
          </div>
        </div>
        {/* FilterModal */}
        <FilterModal modal={{ visible, setVisible, bindings }} />
      </Layout>
    </>
  );
};

export default Explore;
