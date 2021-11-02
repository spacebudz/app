import React from "react";
import { Search, setFilter } from "../components/Filter";
import InfiniteGrid from "../components/InfiniteGrid";
import { FloatingButton } from "../components/Button";
import { ChevronUp, ChevronDown } from "@geist-ui/react-icons";
import { FilterModal } from "../components/Filter";
import Metadata from "../components/Metadata";
import { Button, ButtonGroup } from "@chakra-ui/button";
import { Box, SimpleGrid } from "@chakra-ui/layout";
import { mdiFilterOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useDisclosure } from "@chakra-ui/hooks";
import { Checkbox } from "@chakra-ui/checkbox";
import { Spinner } from "@chakra-ui/spinner";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Explore = ({ pageContext: { spacebudz, initialOrder }, location }) => {
  const fullList = React.useRef([]);
  const recentSearch = React.useRef();
  const filterInterval = React.useRef();

  const [array, setArray] = React.useState([]);
  const [filters, setFilters] = React.useState({
    order_id: null,
    order_price: null,
    // search: null,
    on_sale: false,
  });
  const [param, setParam] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const setColor = (order, up = true) => {
    if (order === null) return "#b5b5b5";
    if (order === "ASC" && up) return "black";
    if (order === "ASC" && !up) return "#b5b5b5";
    if (order === "DESC" && up) return "#b5b5b5";
    if (order === "DESC" && !up) return "black";
  };

  const numberOfAppliedFilter = () => {
    const f = filters;
    let count = 0;
    if (f.id || f.id === 0) count += 1;
    if (f.types) f.types.forEach(() => (count += 1));
    if (f.gadgets) f.gadgets.forEach(() => (count += 1));
    if (f.range && f.range.length > 0) count += 1;
    if (f.gadgetsCount) count += 1;
    return count;
  };

  const applySearch = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    const order_id = urlParams.get("order_id");
    const order_price = urlParams.get("order_price");
    const on_sale = urlParams.get("on_sale");
    const types = urlParams.getAll("type");
    const gadgets = urlParams.getAll("gadget");
    const range = urlParams.getAll("range");
    const gadgetsCount = urlParams.get("gadgetsCount");
    const searchString = (
      id +
      types +
      gadgets +
      range +
      gadgetsCount +
      order_id +
      order_price +
      on_sale
    ).toString();
    if (searchString === recentSearch.current) return;
    recentSearch.current = searchString;
    setLoading(true);
    if (
      id ||
      id === 0 ||
      types.length > 0 ||
      gadgets.length > 0 ||
      range.length > 0 ||
      gadgetsCount ||
      order_id ||
      order_price ||
      on_sale
    ) {
      if (id || id === 0) setParam(id);
      await sleep();
      const f = filters;
      f.id = id;
      f.types = types;
      f.gadgets = gadgets;
      f.range = range;
      f.gadgetsCount = gadgetsCount;
      f.order_id = order_id;
      f.order_price = order_price;
      f.on_sale = Boolean(on_sale);
      const filtered = await setFilter(fullList.current, f);
      setArray(null);
      setTimeout(() => setArray(filtered));
      setFilters(f);
    } else {
      setParam("");
      setArray(fullList.current);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    const offers = await fetch(`https://spacebudz.io/api/offers`)
      .then((res) => res.json())
      .then((res) => res.offers);
    offers.forEach(({ budId, offer }) => {
      spacebudz[budId] = { ...spacebudz[budId], price: offer.amount };
    });
    fullList.current = initialOrder.map((id) => spacebudz[id]);

    filterInterval.current = setInterval(() => {
      applySearch();
    });
  };

  React.useEffect(() => {
    fetchData();
    return () => {
      recentSearch.current = "";
      clearInterval(filterInterval.current);
    };
  }, []);

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz | Explore"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
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
          {/* <Headroom> */}
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
                    if (e.target.value === "") return;
                    window.history.pushState(
                      {},
                      null,
                      `/explore/?id=${e.target.value}`
                    );
                  }
                }}
                onSearch={(e) => {
                  window.scrollTo(0, 0);

                  if (e === "") return;
                  window.history.pushState({}, null, `/explore/?id=${e}`);
                }}
                onChange={(e) => {
                  if (e.target.value) e.persist();
                  if (
                    e.target.value === "" &&
                    array.toString() != fullList.current
                  ) {
                    window.history.pushState({}, null, `/explore/`);
                    return;
                  }
                }}
              />
              <Box h={5} />
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ButtonGroup spacing={1}>
                  <Button
                    onClick={onOpen}
                    position="relative"
                    colorScheme="purple"
                    variant="solid"
                    rounded="2xl"
                    leftIcon={<Icon path={mdiFilterOutline} size={0.7} />}
                  >
                    {array &&
                      array.length < fullList.current.length &&
                      !filters.id &&
                      numberOfAppliedFilter() != 0 && (
                        <Box
                          position="absolute"
                          w="7"
                          h="7"
                          top={-3}
                          right={-2}
                          rounded="full"
                          background="orange.400"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {numberOfAppliedFilter()}
                        </Box>
                      )}
                    Apply Filter
                  </Button>
                  <Button
                    colorScheme="purple"
                    variant="ghost"
                    rounded="2xl"
                    onClick={() => {
                      window.history.pushState({}, null, `/explore/`);
                      setFilters({
                        order_id: null,
                        order_price: null,
                        on_sale: false,
                      });
                    }}
                  >
                    Reset
                  </Button>
                </ButtonGroup>
              </div>
            </div>
          </div>
          {/* </Headroom> */}
          <div>
            <Box h={5} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <SimpleGrid
                columns={[1, null, 3]}
                gap={3}
                style={{ width: "100%", maxWidth: 700 }}
              >
                <Box textAlign="center">
                  <div>
                    <b style={{ fontSize: 16, color: "#777777" }}>
                      Total SpaceBudz:
                    </b>{" "}
                    10,000
                  </div>
                </Box>
                <div style={{ textAlign: "center" }}>
                  <b style={{ color: "#777777", fontSize: 16 }}>Result: </b>
                  {array ? array.length.toLocaleString() : 0}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    onClick={() => {
                      const f = filters;
                      f.order_id = filters.order_id
                        ? filters.order_id === "ASC"
                          ? "DESC"
                          : null
                        : "ASC";
                      const urlParams = new URLSearchParams(
                        window.location.search
                      );
                      urlParams.delete("order_price");
                      let base = "/explore/";
                      if (f.order_id) {
                        urlParams.set("order_id", f.order_id);
                        base += "?" + urlParams;
                      } else {
                        urlParams.delete("order_id");
                        base += "?" + urlParams;
                      }

                      window.history.pushState({}, null, base);
                    }}
                    style={{
                      textAlign: "center",
                      display: "flex",
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {" "}
                      <ChevronUp size={18} color={setColor(filters.order_id)} />
                      <div style={{ marginBottom: -10 }} />
                      <ChevronDown
                        size={18}
                        color={setColor(filters.order_id, false)}
                      />
                    </div>
                    <div style={{ width: 3 }} />
                    <b style={{ color: "#777777", fontSize: 16 }}>ID #</b>
                  </div>
                  {/* Order by price */}
                  <Box w={3} />
                  <div
                    onClick={() => {
                      const f = filters;
                      f.order_price = filters.order_price
                        ? filters.order_price === "ASC"
                          ? "DESC"
                          : null
                        : "ASC";
                      const urlParams = new URLSearchParams(
                        window.location.search
                      );
                      urlParams.delete("order_id");
                      let base = "/explore/";
                      if (f.order_price) {
                        urlParams.set("order_price", f.order_price);
                        base += "?" + urlParams;
                      } else {
                        urlParams.delete("order_price");
                        base += "?" + urlParams;
                      }

                      window.history.pushState({}, null, base);
                    }}
                    style={{
                      textAlign: "center",
                      display: "flex",
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {" "}
                      <ChevronUp
                        size={18}
                        color={setColor(filters.order_price)}
                      />
                      <div style={{ marginBottom: -10 }} />
                      <ChevronDown
                        size={18}
                        color={setColor(filters.order_price, false)}
                      />
                    </div>
                    <div style={{ width: 3 }} />
                    <b style={{ color: "#777777", fontSize: 16 }}>Price</b>
                  </div>
                  {/* Filter on sale */}
                  <Box w={3} />
                  <div
                    style={{
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {" "}
                      <Checkbox
                        isChecked={filters.on_sale}
                        onChange={() => {
                          const f = filters;
                          f.on_sale = !filters.on_sale;
                          const urlParams = new URLSearchParams(
                            window.location.search
                          );
                          let base = "/explore/";
                          if (f.on_sale) {
                            urlParams.set("on_sale", f.on_sale);
                            base += "?" + urlParams;
                          } else {
                            urlParams.delete("on_sale");
                            base += "?" + urlParams;
                          }

                          window.history.pushState({}, null, base);
                        }}
                        css={`
                          > span:first-of-type {
                            box-shadow: unset;
                          }
                        `}
                      />
                    </div>
                    <div style={{ width: 5 }} />
                    <b style={{ color: "#777777", fontSize: 16 }}>On Sale</b>
                  </div>
                </div>
              </SimpleGrid>
            </div>
          </div>
          <Box h={8} />
          <div
            style={{
              marginBottom: 100,
            }}
          >
            {loading ? (
              <Box
                mt="30px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Spinner size="sm" color="purple" />
              </Box>
            ) : (
              array && (
                <InfiniteGrid
                  array={array}
                  spacebudz={spacebudz}
                  type={"Buy"}
                />
              )
            )}
          </div>
        </div>
      </div>
      {/* FilterModal */}
      <FilterModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
    </>
  );
};

export default Explore;
