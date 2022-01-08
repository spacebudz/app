import { Grid } from "@geist-ui/react";
import React from "react";
import { Range } from "rc-slider";
import "rc-slider/assets/index.css";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";

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

const FilterModal = ({ isOpen, onOpen, onClose }) => {
  const [types, setTypes] = React.useState({});
  const [gadgets, setGadgets] = React.useState({});
  const [sliderGadgets, setSliderGadgets] = React.useState("Any");
  const [sliderId, setSliderId] = React.useState([0, 9999]);

  React.useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      blockScrollOnMount
      isCentered
    >
      <ModalOverlay />
      <ModalContent overflowY="scroll" height="80vh">
        <ModalHeader>Filter</ModalHeader>
        <ModalCloseButton
          _hover={{ background: "none" }}
          _focus={{ background: "none" }}
          cursor="pointer"
        />
        <div
          onClick={() => onClose}
          style={{
            position: "absolute",
            right: 25,
            top: 25,
            cursor: "pointer",
          }}
        ></div>
        <ModalBody
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div className="filterModal">
            <Box h={4} />
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
              <Box h={3} />
              <div style={{ fontSize: 12 }}>
                {sliderId[0]} - {sliderId[1]}
              </div>
              <Box h={2} />
              <Range
                min={0}
                max={9999}
                value={[sliderId[0], sliderId[1]]}
                onChange={(value) => setSliderId(value)}
                style={{ width: "80%" }}
                railStyle={{ background: "#E2E8F0", borderRadius: 30 }}
                handleStyle={[
                  { backgroundColor: "#6B46C1", borderColor: "#6B46C1" },
                  { backgroundColor: "#6B46C1", borderColor: "#6B46C1" },
                ]}
                trackStyle={[{ backgroundColor: "#6B46C1" }]}
                activeDotStyle={{ backgroundColor: "#6B46C1" }}
              />
            </div>
            <Box h={6} />
            <div style={{ fontWeight: 500, fontSize: 22, marginLeft: 15 }}>
              Types
            </div>
            <Box h={5} />
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
                      <Switch
                        isChecked={(types && types[type]) || false}
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
            <Box h={5} />

            <div style={{ fontWeight: 500, fontSize: 22, marginLeft: 15 }}>
              Gadgets
            </div>
            <Box h={3} />
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
              <Box h={3} />
              <Slider
                width="80%"
                value={sliderGadgets === "Any" ? 0 : sliderGadgets}
                min={0}
                max={12}
                step={1}
                onChange={(val) =>
                  val === 0 ? setSliderGadgets("Any") : setSliderGadgets(val)
                }
              >
                <SliderTrack>
                  <SliderFilledTrack background="purple.600" />
                </SliderTrack>
                <SliderThumb color="white" background="purple.600" boxSize={10}>
                  {sliderGadgets}
                </SliderThumb>
              </Slider>
            </div>
            <Box h={10} />
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
                      <Switch
                        isChecked={(gadgets && gadgets[gadget]) || false}
                        isDisabled={
                          gadgets &&
                          gadgets["No Gadget"] &&
                          gadget != "No Gadget"
                        }
                        onChange={(e) => {
                          const val = e.target.checked;
                          if (gadgets)
                            if (gadget === "No Gadget") {
                              setGadgets(null);
                              setTimeout(() =>
                                setGadgets({
                                  [gadget]: val,
                                })
                              );
                            } else
                              setGadgets({
                                ...gadgets,
                                [gadget]: val,
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
        </ModalBody>
        <ModalFooter>
          <Button
            rounded="2xl"
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
          </Button>
          <Box w={2} />
          <Button
            rounded="2xl"
            colorScheme="purple"
            onClick={() => {
              const urlParams = new URLSearchParams();
              Object.keys(types).forEach(
                (type) => types[type] && urlParams.append("type", type)
              );
              Object.keys(gadgets).forEach(
                (gadget) =>
                  gadgets[gadget] && urlParams.append("gadget", gadget)
              );

              let base = "/explore/?";

              if (sliderId != [0, 9999].toString()) {
                urlParams.append("range", sliderId[0]);
                urlParams.append("range", sliderId[1]);
              }

              if (sliderGadgets != "Any") {
                urlParams.append("gadgetsCount", sliderGadgets);
              }

              window.history.pushState({}, null, base + urlParams);

              setGadgets(null);
              setTypes(null);
              setTimeout(() => {
                setGadgets({});
                setTypes({});
                setSliderGadgets("Any");
                setSliderId([0, 9999]);
              });
              onClose();
            }}
          >
            Apply Filter
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilterModal;
