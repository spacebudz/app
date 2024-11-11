import build from "./build.json" with {type:"json"};
import metadata from "https://raw.githubusercontent.com/spacebudz/wormhole/refs/heads/main/artifacts/metadata.json" with {type:"json"};
// import metadata_extended from "./metadata_extended.json" with {type: "json"};
import _ from "npm:lodash";

const nameMap = (category, property1, property2) => {
  const propertyMap = {
    "green.png": { color: "Green" },
    "starLight.png": { trait: "Star Suit", color: "Gray" },
    "red.png": { color: "Red" },
    "beltFullPurple.png": {
      trait: "Belt",
      extra: "Pipe",
      color: "Purple",
    },
    default: { emotion: "Classic" },
    "closedOrange.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Orange" },
    ],
    "light.png": { color: "Light" },
    "cyan.png": { color: "Blue" },
    "default.png": { trait: "Suit", color: "Gray" },
    "orange.png": { color: "Orange" },
    right: { position: "Right" },
    "revolver.png": { trait: "Revolver" },
    "blue.png": { color: "Blue" },
    left: { position: "Left" },
    "lightsaberBlue.png": { trait: "Sword", color: "Gray" },
    "defaultBelt.png": { trait: "Suit", color: "Gray" },
    Happy: { emotion: "Happy" },
    "pink.png": { color: "Pink" },
    "ski.png": { trait: "Ski Goggles" },
    "woolly.png": null,
    "purple.png": { color: "Purple" },
    both: { position: "Both" },
    "SPO.png": { trait: "SPO" },
    "gradientStar1.png": {
      trait: "Special Background",
      color: "Blue",
    },
    "yellow.png": { color: "Yellow" },
    Shy: { emotion: "Shy" },
    "xray.png": { trait: "X-Ray" },
    "black.png": { color: "Black" },
    Joking: { emotion: "Joking" },
    "snorkel.png": { trait: "Snorkel" },
    "gold.png": null,
    Confused: { emotion: "Confused" },
    "beltFullLight.png": { trait: "Belt", extra: "Pipe", color: "Brown" },
    "camoBrown.png": { trait: "Camo Suit", color: "Brown" },
    Angry: { emotion: "Angry" },
    "white.png": { color: "White" },
    "beltFullRed.png": { trait: "Belt", extra: "Pipe", color: "Red" },
    "cardano.png": { trait: "Cardano", color: "Yellow" },
    "gradientStar0.png": {
      trait: "Special Background",
      color: "Blue",
    },
    "closedBrown.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Brown" },
    ],
    "starGreen.png": { trait: "Star Suit", color: "Green" },
    "brown.png": { color: "Brown" },
    "dark.png": { color: "Black" },
    "starYellow.png": { trait: "Star Suit", color: "Yellow" },
    "closedGreen.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Green" },
    ],
    "flowers.png": { trait: "Flowers" },
    "sunglasses.png": { trait: "Sun Glasses" },
    "beltFullCyan.png": { trait: "Belt", extra: "Pipe", color: "Blue" },
    Greedy: { emotion: "Greedy" },
    "bazooka.png": { trait: "Bazooka" },
    "closedPanda.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "White" },
    ],
    Sad: { emotion: "Sad" },
    "closedRed.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Red" },
    ],
    "jet.png": { trait: "Jetpack" },
    "amulet.png": { trait: "Amulet" },
    "pistol.png": { trait: "Pistol", color: "Blue" },
    "anchor.png": { trait: "Anchor" },
    "closedWhite.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "White" },
    ],
    "harpoon.png": { trait: "Harpoon", color: "Gray" },
    "gradient1.png": {
      trait: "Special Background",
      color: "Blue",
    },
    "starBlack.png": { trait: "Star Suit", color: "Black" },
    "binoculars.png": { trait: "Binoculars" },
    Serious: { emotion: "Serious" },
    "closedPink.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Pink" },
    ],
    "eyepatch.png": { trait: "Eye Patch" },
    "elephant.png": { typeColor: "Gray" },
    "umbrellaGreen.png": { trait: "Umbrella", color: "Green" },
    "cardanoPink.png": { trait: "Cardano", color: "Pink" },
    "camoPurple.png": { trait: "Camo Suit", color: "Purple" },
    "closedBlue.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Blue" },
    ],
    "arc.png": { trait: "Arc" },
    Shocked: { emotion: "Shocked" },
    "closedYellow.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Yellow" },
    ],
    "flag.png": { trait: "Flag" },
    "axe.png": { trait: "Axe" },
    "defaultPink.png": { trait: "Suit", color: "Pink" },
    "travel.png": { trait: "Backpack" },
    "closedBlack.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Black" },
    ],
    "wine.png": { trait: "Wine" },
    "camoLight.png": { trait: "Camo Suit", color: "Gray" },
    "beltFullBlack.png": { trait: "Belt", extra: "Pipe", color: "Black" },
    "gradient.png": { trait: "Special Background", color: "Orange" },
    "pistolPink.png": { trait: "Pistol", color: "Pink" },
    "jojo.png": { trait: "Jo-Jo" },
    "beltFullBlue.png": { trait: "Belt", extra: "Pipe", color: "Blue" },
    "beltFullGreen.png": { trait: "Belt", extra: "Pipe", color: "Green" },
    Laughing: { emotion: "Laughing" },
    "closedPurple.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Purple" },
    ],
    "blaster.png": { trait: "Blaster" },
    "closedMint.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Green" },
    ],
    "vr.png": { trait: "VR" },
    "starBlue.png": { trait: "Star Suit", color: "Blue" },
    "grey.png": { color: "Gray" },
    "closedPinkSpecial.png": [
      { trait: "Covered Helmet", color: "Pink" },
      { typeColor: "Pink" },
    ],
    Superior: { emotion: "Superior" },
    "gradient0.png": { trait: "Special Background", color: "Purple" },
    "candle.png": { trait: "Candle" },
    "hockeystick.png": { trait: "Hockey Stick" },
    "camoRed.png": { trait: "Camo Suit", color: "Red" },
    "umbrellaPurple.png": { trait: "Umbrella", color: "Purple" },
    "harpoonPink.png": { trait: "Harpoon", color: "Pink" },
    "starRed.png": { trait: "Star Suit", color: "Red" },
    "camoBlue.png": { trait: "Camo Suit", color: "Blue" },
    "closedGrey.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Gray" },
    ],
    "rhino.png": { typeColor: "Gray" },
    Amazed: { emotion: "Amazed" },
    "closedLight.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Light" },
    ],
    "baguette.png": { trait: "Baguette" },
    "camoGreen.png": { trait: "Camo Suit", color: "Green" },
    "fish.png": { typeColor: "Orange" },
    "lightsaberRed.png": { trait: "Sword", color: "Red" },
    "bull.png": { typeColor: "Gray" },
    "closedWolf.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Gray" },
    ],
    "lightsaberGreen.png": { trait: "Sword", color: "Blue" },
    "fishPink.png": { typeColor: "Pink" },
    "umbrellaYellow.png": { trait: "Umbrella", color: "Yellow" },
    "umbrellaRed.png": { trait: "Umbrella", color: "Red" },
    "harpoonYellow.png": { trait: "Harpoon", color: "Yellow" },
    "mint.png": { color: "Green" },
    "umbrellaBlue.png": { trait: "Umbrella", color: "Blue" },
    "wolf.png": { typeColor: "Gray" },
    "panda.png": { color: "Panda" },
    "umbrellaBlack.png": { trait: "Umbrella", color: "Black" },
    "closedRhino.png": [
      { trait: "Covered Helmet", color: "Gray" },
      { typeColor: "Gray" },
    ],
    "umbrellaOrange.png": { trait: "Umbrella", color: "Orange" },
    "bullPink.png": { typeColor: "Pink" },
    "dino.png": { typeColor: "Green" },
    closedRed: [
      { trait: "Covered Helmet", color: "Gray" },
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
        ...replaceColor(category, propertyMap[property1]),
      });
      break;
    case "Gloves": 
      extendedTraits.push({
        trait: "Gloves",
        ...replaceColor(category, propertyMap[property1]),
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
      extendedTraits.push(replaceColor(category,propertyMap[property1]));
      if (!propertyMap[property2]) break;
      else if (category == "Arcane" && property2 == "closedPink.png") {
        extendedTraits = extendedTraits.concat([
          { trait: "Covered Helmet", color: "Pink" },
          { typeColor: "Black" },
        ]);
      } else if (propertyMap[property2].color) {
        extendedTraits.push({ typeColor: replaceColor(category, propertyMap[property2]).color });
      } else extendedTraits = extendedTraits.concat(replaceColor(category, propertyMap[property2]));
      break;
  }

  return extendedTraits;
};

function replaceColor(category, properties) {
  const p = properties instanceof Array ? properties : [properties];
  const result = p.map(x => {
    if (category === "Dog" && x.color === "Blue") return {...x, color: "Black"};
    if (category === "Dog" && x.typeColor === "Blue") return {...x, typeColor:"Black"};
    if (category === "Cat" && x.color === "Yellow") return {...x, color: "Orange"};
    if (category === "Cat" && x.typeColor === "Yellow") return {...x, typeColor:"Orange"};
    if (category === "Gloves" && x.color === "Light") return {...x, color: "Brown"};
    if (category === "Bear" && x.color === "Black")return {...x, color: "Brown"};
    if (category === "Bear" && x.typeColor === "Black") return {...x, typeColor:"Brown"};
    if (category === "Lion" && x.color === "Light")return {...x, color: "Orange"};
    if (category === "Lion" && x.typeColor === "Light") return {...x, typeColor:"Orange"};
    if (category === "Dog" && x.color === "Light")return {...x, color: "Brown"};
    if (category === "Dog" && x.typeColor === "Light") return {...x, typeColor:"Brown"};
    if (category === "Belts" && x.color === "Light") return {...x, color: "Brown"};
    // replace emotion
    if (category === "Rhino" && x.emotion === "Classic") return {...x, emotion:"Amazed"};
    if (category === "Parrot" && x.emotion === "Classic") return {...x, emotion:"Amazed"};
    if (category === "Dino" && x.emotion === "Classic") return {...x, emotion:"Superior"};
    if (category === "Wolf" && x.emotion === "Classic") return {...x, emotion:"Angry"};
    if (category === "Bull" && x.emotion === "Classic") return {...x, emotion:"Angry"};
    if (category === "Fish" && x.emotion === "Classic") return {...x, emotion:"Serious"};
    if (category === "Shark" && x.emotion === "Classic") return {...x, emotion:"Shocked"};
    if (category === "Elephant" && x.emotion === "Classic") return {...x, emotion:"Shocked"};
    if (category === "Frog" && x.emotion === "Classic") return {...x, emotion:"Happy"};
    return x;
  })
  return properties instanceof Array ? result : result[0];
}

const result = {};
build.forEach((bud, budId) => {
  let traits = [];
  bud.forEach((p) => {
    const category = p.path.split("/")[1];
    const property1 = p.path.split("/")[2];
    const property2 = p.path.split("/")[3];
    const extendedProperties = nameMap(category, property1, property2);
    traits = traits.concat(extendedProperties);
  });
  result[budId] = { ...metadata[budId], extendedProperties: traits };
});

Deno.writeTextFileSync("./metadata_extended.json", JSON.stringify(result));

// const totalProperties = {};

// for (const budId in metadata_extended) {
//   const properties = metadata_extended[budId].extendedProperties;
//   properties.forEach((property) => {
//     if (property.trait) {
//       if (property.position || property.extra) {
//         if (property.color) {
//           if (
//             _.get(
//               totalProperties,
//               `${property.trait}.${property.position || property.extra}.${
//                 property.color
//               }`
//             )
//           )
//             totalProperties[property.trait][
//               property.position || property.extra
//             ][property.color] += 1;
//           else {
//             _.set(
//               totalProperties,
//               `${property.trait}.${property.position || property.extra}.${
//                 property.color
//               }`,
//               1
//             );
//           }
//         } else {
//           if (
//             _.get(
//               totalProperties,
//               `${property.trait}.${property.position || property.extra}`
//             )
//           )
//             totalProperties[property.trait][
//               property.position || property.extra
//             ] += 1;
//           else {
//             _.set(
//               totalProperties,
//               `${property.trait}.${property.position || property.extra}`,
//               1
//             );
//           }
//         }
//       } else {
//         if (property.color) {
//           if (!_.get(totalProperties, `${property.trait}.${property.color}`))
//             _.set(totalProperties, `${property.trait}.${property.color}`, 1);
//           else {
//             totalProperties[property.trait][property.color] += 1;
//           }
//         } else {
//           if (totalProperties[property.trait])
//             totalProperties[property.trait] += 1;
//           else {
//             _.set(totalProperties, `${property.trait}`, 1);
//           }
//         }
//       }
//     } else if (property.emotion) {
//       if (_.get(totalProperties, `Emotions.${property.emotion}`))
//         totalProperties["Emotions"][property.emotion] += 1;
//       else {
//         _.set(totalProperties, `Emotions.${property.emotion}`, 1);
//       }
//     } else if (property.typeColor) {
//       if (_.get(totalProperties, `Types.${property.typeColor}`))
//         totalProperties["Types"][property.typeColor] += 1;
//       else {
//         _.set(totalProperties, `Types.${property.typeColor}`, 1);
//       }
//     }
//   });
// }

// console.log(totalProperties);
