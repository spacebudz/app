import React from "react";
import { GridLayout } from "@egjs/react-infinitegrid";
import "./InfiniteGrid.css";
import { Link } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { LazyLoadImage } from "react-lazy-load-image-component";
import styled, { keyframes } from "styled-components";
import { Box } from "@chakra-ui/layout";
import { UnitDisplay } from "../UnitDisplay";
import { Spinner } from "@chakra-ui/spinner";

var converterEngine = function (input) {
  // fn BLOB => Binary => Base64 ?
  var uInt8Array = new Uint8Array(input),
    i = uInt8Array.length;
  var biStr = []; //new Array(i);
  while (i--) {
    biStr[i] = String.fromCharCode(uInt8Array[i]);
  }
  var base64 = window.btoa(biStr.join(""));
  return base64;
};

var getImageBase64 = function (url, callback) {
  // 1. Loading file from url:
  var xhr = new XMLHttpRequest(url);
  xhr.open("GET", url, true); // url is the url of a PNG image.
  xhr.responseType = "arraybuffer";
  xhr.callback = callback;
  xhr.onload = function (e) {
    if (this.status == 200) {
      // 2. When loaded, do:
      var imgBase64 = converterEngine(this.response); // convert BLOB to base64
      this.callback(imgBase64); //execute callback function with data
    }
  };
  xhr.send();
};

const fade = keyframes`
  from { opacity: 0}
  to   { opacity: 1}
`;

const CustomLazyImage = styled(LazyLoadImage)`
  animation: ${fade} 0.4s;
`;

const Item = ({ bud, im, type, hasDouble }) => {
  const [image, setImage] = React.useState(null);
  React.useEffect(() => {
    // getImageBase64(im, (data) => setImage("data:image/png;base64," + data));
    setImage(im);
  }, []);

  return (
    <div className="itemGrid">
      <Link to={`/explore/spacebud/${bud.id}`}>
        <div className="thumbnail">
          {hasDouble ? (
            <Box
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              flexDirection={"column"}
              marginBottom={"-88px"}
            >
              <div
                style={{
                  textAlign: "center",
                  // marginBottom: -55,
                  background: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  zIndex: 1,
                  opacity:
                    type === "Bid"
                      ? bud.bidPrice
                        ? 1
                        : 0
                      : bud.listingPrice
                      ? 1
                      : 0,
                  color: "black",
                  padding: "4px 16px",
                  border: "solid 2px #777777",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ color: "#777777", marginRight: 4 }}>{type}</span>{" "}
                <span>
                  {" "}
                  <UnitDisplay
                    quantity={type === "Bid" ? bud.bidPrice : bud.listingPrice}
                    decimals={6}
                    symbol="₳"
                  />
                </span>
              </div>
              <div
                style={{
                  textAlign: "center",
                  // marginBottom: -55,
                  background: "white",
                  fontSize: 14,
                  fontWeight: 600,
                  zIndex: 1,
                  opacity:
                    type === "Bid"
                      ? bud.listingPrice
                        ? 1
                        : 0
                      : bud.bidPrice
                      ? 1
                      : 0,
                  color: "black",
                  padding: "4px 16px",
                  border: "solid 2px #777777",
                  borderRadius: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  as={"span"}
                  color={"purple.400"}
                  fontWeight={"bold"}
                  style={{ marginRight: 4 }}
                >
                  {type === "Bid" ? "Listed" : "Bid"}
                </Box>{" "}
                <span>
                  {" "}
                  <UnitDisplay
                    quantity={type === "Bid" ? bud.listingPrice : bud.bidPrice}
                    decimals={6}
                    symbol="₳"
                  />
                </span>
              </div>
            </Box>
          ) : (
            <div
              style={{
                textAlign: "center",
                marginBottom: -55,
                background: "white",
                fontSize: 14,
                fontWeight: 600,
                zIndex: 1,
                opacity: !bud.price && 0,
                color: "black",
                padding: "4px 16px",
                border: "solid 2px #777777",
                borderRadius: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#777777", marginRight: 4 }}>{type}</span>{" "}
              <span>
                {" "}
                <UnitDisplay quantity={bud.price} decimals={6} symbol="₳" />
              </span>
            </div>
          )}
          {!image ? (
            <div></div>
          ) : (
            <CustomLazyImage
              threshold={400}
              alt={`SpaceBud #${bud.id}`}
              effect="opacity"
              src={image}
            />
          )}
        </div>
        <div className="info">{`SpaceBud #${bud.id}`}</div>
      </Link>
    </div>
  );
};

const ScreenWidth = (props) => {
  const matches = useBreakpoint();

  return <InfiniteGrid {...props} matches={!matches.md} />;
};

class InfiniteGrid extends React.Component {
  state = { list: [], lastLoad: false };
  start = 0;
  updateLastOnce = true;
  loadItems(groupKey, num) {
    const items = [];
    const start = this.start || 0;

    for (let i = 0; i < num; ++i) {
      const bud = this.props.array[start + i];
      items.push(
        <Item
          im={this.props.spacebudz[bud.id].image}
          groupKey={groupKey}
          key={start + i}
          bud={this.props.array[start + i]}
          type={this.props.type}
          hasDouble={this.props.hasDouble}
        />
      );
    }
    this.start = start + num;
    return items;
  }
  onAppend = ({ groupKey, startLoading }) => {
    if (
      this.state.list.length + 50 >= this.props.array.length &&
      this.updateLastOnce
    ) {
      this.setState({ ...this.state, lastLoad: true });
      this.updateLastOnce = false;
    }
    if (this.state.list.length >= this.props.array.length) return;
    startLoading();

    const loadVolume =
      this.props.array.length - this.start <= 50
        ? this.props.array.length - this.start
        : 50;

    const list = this.state.list;
    const items = this.loadItems((parseFloat(groupKey) || 0) + 1, loadVolume);

    this.setState({ list: list.concat(items) });
  };
  onLayoutComplete = ({ isLayout, endLoading }) => {
    !isLayout && endLoading();
    if (!this.updateLastOnce) this.setState({ ...this.state, lastLoad: false });
  };
  render() {
    return this.props.array.length > 0 ? (
      <div>
        <GridLayout
          options={{
            useRecycle: false,
            isConstantSize: true,
          }}
          layoutOptions={{
            margin: !this.props.matches && -6,
            align: "center",
          }}
          onAppend={this.onAppend}
          onLayoutComplete={this.onLayoutComplete}
        >
          {this.state.list}
        </GridLayout>
        {(!(this.state.list.length >= this.props.array.length) ||
          this.state.lastLoad) && (
          <Box
            w="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <div style={{ height: 100 }} />
            <Spinner size="sm" color="purple" />
          </Box>
        )}
      </div>
    ) : (
      <div style={{ width: "100%", textAlign: "center" }}>
        No SpaceBud found
      </div>
    );
  }
}

export default ScreenWidth;
