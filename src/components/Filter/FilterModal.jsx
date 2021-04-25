import { Grid, Modal, Slider, Spacer, Toggle } from "@geist-ui/react";
import { X } from "@geist-ui/react-icons";
import React from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";

//assets
// import Ape from "../../images/assets/ape.png";

//css
import "./FilterModal.css";

const COUNT_MAP = {
  types: {
    Frog: 523,
    Alien: 1088,
    Ape: 1114,
    Tiger: 845,
    Robot: 980,
    Dog: 1188,
    Bear: 799,
    Cat: 1191,
    Parrot: 545,
    Arcane: 602,
    Lion: 553,
    Elephant: 62,
    Shark: 198,
    Rhino: 100,
    Bull: 22,
    Fish: 83,
    Wolf: 99,
    Dino: 8,
  },
  gadgets: {
    "Star Suit": 1820,
    Chestplate: 7483,
    Belt: 8948,
    "Covered Helmet": 4996,
    Revolver: 388,
    Sword: 414,
    "Ski Goggles": 439,
    "Wool Boots": 827,
    SPO: 30,
    "Special Background": 730,
    "X-Ray": 427,
    Snorkel: 434,
    Watch: 911,
    "Camo Suit": 1816,
    Cardano: 331,
    Flowers: 298,
    "Sun Glasses": 410,
    Bazooka: 219,
    Jetpack: 356,
    Amulet: 669,
    Pistol: 342,
    Anchor: 210,
    Harpoon: 247,
    Binoculars: 140,
    "Eye Patch": 439,
    Umbrella: 341,
    Arc: 201,
    Flag: 340,
    Axe: 263,
    Backpack: 349,
    Wine: 192,
    "Jo-Jo": 189,
    Blaster: 164,
    VR: 506,
    Candle: 150,
    "Hockey Stick": 241,
    Baguette: 152,
    "Lamp Fish": 157,
    "No Gadget": 30,
  },
};

let sliderMinValue = 0;
let sliderMaxValue = 9999;

const FilterModal = (props) => {
  const [types, setTypes] = React.useState({});
  const [gadgets, setGadgets] = React.useState({});
  const [sliderGadgets, setSliderGadgets] = React.useState("Any");
  const [sliderId, setSliderId] = React.useState([0, 9999]);

  React.useEffect(() => {
    if (!props.modal.visible) return;
    const urlParams = new URLSearchParams(window.location.search);
    const typesArray = urlParams.getAll("type");
    const gadgetsArray = urlParams.getAll("gadget");
    const gadgetsCount = parseInt(urlParams.get("gadgetsCount"));
    const range = urlParams.getAll("range");
    const typesObject = {};
    const gadgetsObject = {};
    typesArray.forEach((type) => (typesObject[type] = true));
    gadgetsArray.forEach((gadget) => (gadgetsObject[gadget] = true));
    setTypes(typesObject);
    setGadgets(gadgetsObject);
    setSliderId(
      range.length > 0 ? [parseInt(range[0]), parseInt(range[1])] : [0, 9999]
    );
    setSliderGadgets(gadgetsCount ? gadgetsCount : "Any");
  }, [props.modal.visible]);

  return (
    <Modal
      width="1000px"
      {...props.modal.bindings}
      open={props.modal.visible}
      style={{ position: "relative" }}
    >
      <Modal.Title>Filter</Modal.Title>
      <div
        onClick={() => props.modal.setVisible(false)}
        style={{ position: "absolute", right: 25, top: 25, cursor: "pointer" }}
      >
        <X />
      </div>
      <Modal.Content
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "65vh",
            // marginTop: -30,
            // marginBottom: -30,
            overflowY: "scroll",
            overflowX: "hidden",
          }}
          className="filterModal"
        >
          <Spacer y={0.5} />
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div>Id Range</div>
            <Spacer y={0.5} />
            <div style={{ fontSize: 12 }}>
              {sliderId[0]} - {sliderId[1]}
            </div>
            <Spacer y={0.2} />
            <Range
              min={0}
              max={9999}
              value={[sliderId[0], sliderId[1]]}
              onChange={(value) => setSliderId(value)}
              style={{ width: "80%" }}
              railStyle={{ background: "black", borderRadius: 30 }}
              handleStyle={[
                { backgroundColor: "#3A3169", borderColor: "#3A3169" },
                { backgroundColor: "#3A3169", borderColor: "#3A3169" },
              ]}
              trackStyle={[{ backgroundColor: "#3A3169" }]}
            />
          </div>
          <Spacer y={1.5} />
          <div style={{ fontWeight: 500, fontSize: 22, marginLeft: 15 }}>
            Types
          </div>
          <Spacer y={1} />
          <Grid.Container gap={2}>
            {[
              "Ape",
              "Dino",
              "Cat",
              "Bull",
              "Robot",
              "Frog",
              "Dog",
              "Elephant",
              "Bear",
              "Fish",
              "Parrot",
              "Tiger",
              "Shark",
              "Rhino",
              "Arcane",
              "Wolf",
              "Alien",
              "Lion",
            ].map((type, i) => (
              <Grid
                key={i}
                xs={12}
                md={6}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Grid.Container style={{ maxWidth: 220 }}>
                  <Grid
                    xs={12}
                    md={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={`../../../FilterPreview/${type}.png`}
                      width={60}
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    md={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ fontSize: 15, textAlign: "center" }}>
                      <b>{type}</b>
                      <br />
                      <span style={{ fontSize: 12 }}>
                        ({COUNT_MAP.types[type]})
                      </span>
                    </div>
                  </Grid>
                  <Grid
                    xs={24}
                    md={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Toggle
                      checked={types && types[type]}
                      size="large"
                      onChange={(e) => {
                        if (types)
                          setTypes({ ...types, [type]: e.target.checked });
                        else setTypes({ [type]: true });
                      }}
                    />
                  </Grid>
                </Grid.Container>
              </Grid>
            ))}
          </Grid.Container>
          <Spacer y={1.3} />

          <div style={{ fontWeight: 500, fontSize: 22, marginLeft: 15 }}>
            Gadgets
          </div>
          <Spacer y={0.5} />
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div>Minimum Gadgets Count</div>
            <Spacer y={0.5} />
            <Slider
              step={1}
              showMarkers
              max={12}
              min={0}
              value={sliderGadgets}
              onChange={(val) =>
                val == 0 ? setSliderGadgets("Any") : setSliderGadgets(val)
              }
              style={{ width: "80%" }}
            />
          </div>
          <Spacer y={2} />
          <Grid.Container gap={2}>
            {[
              "No Gadget",
              "Axe",
              "Belt",
              "Chestplate",
              "Covered Helmet",
              "Star Suit",
              "Camo Suit",
              "Watch",
              "Wool Boots",
              "Special Background",
              "Amulet",
              "VR",
              "Ski Goggles",
              "Eye Patch",
              "Snorkel",
              "X-Ray",
              "Sword",
              "Sun Glasses",
              "Revolver",
              "Jetpack",
              "Backpack",
              "Pistol",
              "Umbrella",
              "Flag",
              "Cardano",
              "Flowers",
              "Harpoon",
              "Hockey Stick",
              "Bazooka",
              "Anchor",
              "Arc",
              "Wine",
              "Jo-Jo",
              "Blaster",
              "Lamp Fish",
              "Baguette",
              "Candle",
              "Binoculars",
              "SPO",
            ].map((gadget, i) => (
              <Grid key={i} xs={12} md={6}>
                <Grid.Container style={{ maxWidth: 220 }}>
                  <Grid
                    xs={12}
                    md={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={`../../../FilterPreview/${gadget}.png`}
                      width={60}
                    />
                  </Grid>
                  <Grid
                    xs={12}
                    md={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 15, textAlign: "center" }}>
                      <b>{gadget}</b>
                      <br />
                      <span style={{ fontSize: 12 }}>
                        ({COUNT_MAP.gadgets[gadget]})
                      </span>
                    </div>
                  </Grid>
                  <Grid
                    xs={24}
                    md={8}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Toggle
                      checked={gadgets && gadgets[gadget]}
                      size="large"
                      disabled={
                        gadgets && gadgets["No Gadget"] && gadget != "No Gadget"
                      }
                      onChange={(e) => {
                        if (gadgets)
                          if (gadget == "No Gadget") {
                            setGadgets(null);
                            setTimeout(() =>
                              setGadgets({
                                [gadget]: e.target.checked,
                              })
                            );
                          } else
                            setGadgets({
                              ...gadgets,
                              [gadget]: e.target.checked,
                            });
                        else setGadgets({ [gadget]: true });
                      }}
                    />
                  </Grid>
                </Grid.Container>
              </Grid>
            ))}
          </Grid.Container>
        </div>
      </Modal.Content>
      <Modal.Action
        passive
        onClick={() => {
          setGadgets(null);
          setTypes(null);
          setTimeout(() => {
            setGadgets({});
            setTypes({});
            setSliderGadgets("Any");
            setSliderId([0, 9999]);
          });
          window.history.pushState({}, null, `/explore`);
        }}
      >
        Reset
      </Modal.Action>
      <Modal.Action
        onClick={() => {
          const paramsType = new URLSearchParams();
          Object.keys(types).forEach(
            (type) => types[type] && paramsType.append("type", type)
          );
          const paramsGadget = new URLSearchParams();
          Object.keys(gadgets).forEach(
            (gadget) => gadgets[gadget] && paramsGadget.append("gadget", gadget)
          );

          let base = "/explore/?";

          if (paramsType.has("type")) {
            base += paramsType + "&";
          }
          if (paramsGadget.has("gadget")) {
            base += paramsGadget + "&";
          }

          if (sliderId != [0, 9999].toString()) {
            const paramsIdRange = new URLSearchParams();
            paramsIdRange.append("range", sliderId[0]);
            paramsIdRange.append("range", sliderId[1]);
            base += paramsIdRange + "&";
          }

          if (sliderGadgets != "Any") {
            const paramsGadgetsCount = new URLSearchParams();
            paramsGadgetsCount.append("gadgetsCount", sliderGadgets);
            base += paramsGadgetsCount + "&";
          }

          if (base != "/explore/?") {
            base = base.slice(0, -1);
            window.history.pushState({}, null, base);
          }

          setGadgets(null);
          setTypes(null);
          setTimeout(() => {
            setGadgets({});
            setTypes({});
            setSliderGadgets("Any");
            setSliderId([0, 9999]);
          });
          props.modal.setVisible(false);
        }}
      >
        Apply Filter
      </Modal.Action>
    </Modal>
  );
};

export default FilterModal;
