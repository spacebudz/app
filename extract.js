const build = require("./build.json");
const metadata = require("./metadata.json");
const metadata_extended = require("./metadata_extended.json");
const fs = require("fs");
const _ = require("lodash");

const nameMap = (category, property1, property2) => {
  const propertyMap = {
    "green.png": { color: "Green" },
    "starLight.png": { trait: "Star Suit", color: "Light" },
    "red.png": { color: "Red" },
    "beltFullPurple.png": {
      trait: "Belt",
      extra: "Pipe",
      color: "Purple",
    },
    default: { emotion: "Classic" },
    "closedOrange.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Orange" },
    ],
    "light.png": { color: "Light" },
    "cyan.png": { color: "Cyan" },
    "default.png": { trait: "Suit", color: "Classic" },
    "orange.png": { color: "Orange" },
    right: { position: "Right Hand" },
    "revolver.png": { trait: "Revolver" },
    "blue.png": { color: "Blue" },
    left: { position: "Left Hand" },
    "lightsaberBlue.png": { trait: "Sword", color: "Classic" },
    "defaultBelt.png": { trait: "Suit", color: "Classic" },
    Happy: { emotion: "Happy" },
    "pink.png": { color: "Pink" },
    "ski.png": { trait: "Ski Goggles" },
    "woolly.png": null,
    "purple.png": { color: "Purple" },
    both: { position: "Both Hands" },
    "SPO.png": { trait: "SPO" },
    "gradientStar1.png": {
      trait: "Special Background",
      color: "Blue Gradient",
    },
    "yellow.png": { color: "Yellow" },
    Shy: { emotion: "Shy" },
    "xray.png": { trait: "X-Ray" },
    "black.png": { color: "Black" },
    Joking: { emotion: "Joking" },
    "snorkel.png": { trait: "Snorkel" },
    "gold.png": null,
    Confused: { emotion: "Confused" },
    "beltFullLight.png": { trait: "Belt", extra: "Pipe", color: "Light" },
    "camoBrown.png": { trait: "Camo Suit", color: "Brown" },
    Angry: { emotion: "Angry" },
    "white.png": { color: "White" },
    "beltFullRed.png": { trait: "Belt", extra: "Pipe", color: "Red" },
    "cardano.png": { trait: "Cardano", color: "Classic" },
    "gradientStar0.png": {
      trait: "Special Background",
      color: "Blue Star Gradient",
    },
    "closedBrown.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Brown" },
    ],
    "starGreen.png": { trait: "Star Suit", color: "Green" },
    "brown.png": { color: "Brown" },
    "dark.png": { color: "Dark" },
    "starYellow.png": { trait: "Star Suit", color: "Yellow" },
    "closedGreen.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Green" },
    ],
    "flowers.png": { trait: "Flowers" },
    "sunglasses.png": { trait: "Sun Glasses" },
    "beltFullCyan.png": { trait: "Belt", extra: "Pipe", color: "Cyan" },
    Greedy: { emotion: "Greedy" },
    "bazooka.png": { trait: "Bazooka" },
    "closedPanda.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Panda" },
    ],
    Sad: { emotion: "Sad" },
    "closedRed.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Red" },
    ],
    "jet.png": { trait: "Jetpack" },
    "amulet.png": { trait: "Amulet" },
    "pistol.png": { trait: "Pistol", color: "Classic" },
    "anchor.png": { trait: "Anchor" },
    "closedWhite.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "White" },
    ],
    "harpoon.png": { trait: "Harpoon", color: "Classic" },
    "gradient1.png": {
      trait: "Special Background",
      color: "Blue Circular Gradient",
    },
    "starBlack.png": { trait: "Star Suit", color: "Black" },
    "binoculars.png": { trait: "Binoculars" },
    Serious: { emotion: "Serious" },
    "closedPink.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Pink" },
    ],
    "eyepatch.png": { trait: "Eye Patch" },
    "elephant.png": { typeColor: "Classic" },
    "umbrellaGreen.png": { trait: "Umbrella", color: "Green" },
    "cardanoPink.png": { trait: "Cardano", color: "Pink" },
    "camoPurple.png": { trait: "Camo Suit", color: "Purple" },
    "closedBlue.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Blue" },
    ],
    "arc.png": { trait: "Arc" },
    Shocked: { emotion: "Shocked" },
    "closedYellow.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Yellow" },
    ],
    "flag.png": { trait: "Flag" },
    "axe.png": { trait: "Axe" },
    "defaultPink.png": { trait: "Suit", color: "Pink" },
    "travel.png": { trait: "Backpack" },
    "closedBlack.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Black" },
    ],
    "wine.png": { trait: "Wine" },
    "camoLight.png": { trait: "Camo Suit", color: "Light" },
    "beltFullBlack.png": { trait: "Belt", extra: "Pipe", color: "Black" },
    "gradient.png": { trait: "Special Background", color: "Orange Gradient" },
    "pistolPink.png": { trait: "Pistol", color: "Pink" },
    "jojo.png": { trait: "Jo-Jo" },
    "beltFullBlue.png": { trait: "Belt", extra: "Pipe", color: "Blue" },
    "beltFullGreen.png": { trait: "Belt", extra: "Pipe", color: "Green" },
    Laughing: { emotion: "Laughing" },
    "closedPurple.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Purple" },
    ],
    "blaster.png": { trait: "Blaster" },
    "closedMint.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Mint" },
    ],
    "vr.png": { trait: "VR" },
    "starBlue.png": { trait: "Star Suit", color: "Blue" },
    "grey.png": { color: "Gray" },
    "closedPinkSpecial.png": [
      { trait: "Covered Helmet", color: "Pink" },
      { typeColor: "Pink" },
    ],
    Superior: { emotion: "Superior" },
    "gradient0.png": { trait: "Special Background", color: "Purple Fade" },
    "candle.png": { trait: "Candle" },
    "hockeystick.png": { trait: "Hockey Stick" },
    "camoRed.png": { trait: "Camo Suit", color: "Red" },
    "umbrellaPurple.png": { trait: "Umbrella", color: "Purple" },
    "harpoonPink.png": { trait: "Harpoon", color: "Pink" },
    "starRed.png": { trait: "Star Suit", color: "Red" },
    "camoBlue.png": { trait: "Camo Suit", color: "Blue" },
    "closedGrey.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Gray" },
    ],
    "rhino.png": { typeColor: "Classic" },
    Amazed: { emotion: "Amazed" },
    "closedLight.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Light" },
    ],
    "baguette.png": { trait: "Baguette" },
    "camoGreen.png": { trait: "Camo Suit", color: "Green" },
    "fish.png": { typeColor: "Classic" },
    "lightsaberRed.png": { trait: "Sword", color: "Fire" },
    "bull.png": { typeColor: "Classic" },
    "closedWolf.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Classic" },
    ],
    "lightsaberGreen.png": { trait: "Sword", color: "Ice" },
    "fishPink.png": { typeColor: "Pink" },
    "umbrellaYellow.png": { trait: "Umbrella", color: "Yellow" },
    "umbrellaRed.png": { trait: "Umbrella", color: "Red" },
    "harpoonYellow.png": { trait: "Harpoon", color: "Yellow" },
    "mint.png": { color: "Mint" },
    "umbrellaBlue.png": { trait: "Umbrella", color: "Blue" },
    "wolf.png": { typeColor: "Classic" },
    "panda.png": { color: "Panda" },
    "umbrellaBlack.png": { trait: "Umbrella", color: "Black" },
    "closedRhino.png": [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Classic" },
    ],
    "umbrellaOrange.png": { trait: "Umbrella", color: "Orange" },
    "bullPink.png": { typeColor: "Pink" },
    "dino.png": { typeColor: "Classic" },
    closedRed: [
      { trait: "Covered Helmet", color: "Classic" },
      { typeColor: "Red" },
    ],
    "dinoPink.png": { typeColor: "Pink" },
  };

  let extendedTraits = [];
  switch (category) {
    case "Background":
      extendedTraits.push({ trait: "Background", ...propertyMap[property1] });
      break;
    case "Suit":
      extendedTraits.push(propertyMap[property1]);
      break;
    case "Chestplate":
      extendedTraits.push({
        trait: "Chestplate",
        ...propertyMap[property1],
      });
      break;
    case "Belts":
      extendedTraits.push({
        trait: "Belt",
        ...propertyMap[property1],
      });
      break;
    case "Gloves":
      extendedTraits.push({
        trait: "Gloves",
        ...propertyMap[property1],
      });
      break;
    case "Items":
      extendedTraits.push({
        ...propertyMap[property1],
        ...propertyMap[property2],
      });
      break;
    case "Glasses":
      extendedTraits.push(propertyMap[property1]);
      break;
    case "Boots":
      extendedTraits.push({ trait: "Wool Boots" });
      break;
    case "Watch":
      extendedTraits.push({ trait: "Watch" });
      break;
    case "Chain":
      extendedTraits.push({ trait: "Amulet", position: "Neck" });
      break;
    case "Bag":
      extendedTraits.push(propertyMap[property1]);
      break;
    default:
      extendedTraits.push(propertyMap[property1]);
      if (!propertyMap[property2]) break;
      if (propertyMap[property2].color) {
        extendedTraits.push({ typeColor: propertyMap[property2].color });
      } else extendedTraits = extendedTraits.concat(propertyMap[property2]);
      break;
  }

  return extendedTraits;
};

// const result = {};
// build.forEach((bud, budId) => {
//   let traits = [];
//   bud.forEach((p) => {
//     const category = p.path.split("/")[1];
//     const property1 = p.path.split("/")[2];
//     const property2 = p.path.split("/")[3];
//     const extendedProperties = nameMap(category, property1, property2);
//     traits = traits.concat(extendedProperties);
//   });
//   result[budId] = { ...metadata[budId], extendedProperties: traits };
// });

// fs.writeFileSync("metadata_extended.json", JSON.stringify(result));

const totalProperties = {};

for (const budId in metadata_extended) {
  const properties = metadata_extended[budId].extendedProperties;
  properties.forEach((property) => {
    if (property.trait) {
      if (property.position || property.extra) {
        if (property.color) {
          if (
            _.get(
              totalProperties,
              `${property.trait}.${property.position || property.extra}.${
                property.color
              }`
            )
          )
            totalProperties[property.trait][
              property.position || property.extra
            ][property.color] += 1;
          else {
            _.set(
              totalProperties,
              `${property.trait}.${property.position || property.extra}.${
                property.color
              }`,
              1
            );
          }
        } else {
          if (
            _.get(
              totalProperties,
              `${property.trait}.${property.position || property.extra}`
            )
          )
            totalProperties[property.trait][
              property.position || property.extra
            ] += 1;
          else {
            _.set(
              totalProperties,
              `${property.trait}.${property.position || property.extra}`,
              1
            );
          }
        }
      } else {
        if (property.color) {
          if (!_.get(totalProperties, `${property.trait}.${property.color}`))
            _.set(totalProperties, `${property.trait}.${property.color}`, 1);
          else {
            totalProperties[property.trait][property.color] += 1;
          }
        } else {
          if (totalProperties[property.trait])
            totalProperties[property.trait] += 1;
          else {
            _.set(totalProperties, `${property.trait}`, 1);
          }
        }
      }
    } else if (property.emotion) {
      if (_.get(totalProperties, `Emotions.${property.emotion}`))
        totalProperties["Emotions"][property.emotion] += 1;
      else {
        _.set(totalProperties, `Emotions.${property.emotion}`, 1);
      }
    } else if (property.typeColor) {
      if (_.get(totalProperties, `Types.${property.typeColor}`))
        totalProperties["Types"][property.typeColor] += 1;
      else {
        _.set(totalProperties, `Types.${property.typeColor}`, 1);
      }
    }
  });
}

console.log(totalProperties);
