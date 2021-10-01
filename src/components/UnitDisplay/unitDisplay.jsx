import React from "react";
import { Box } from "@chakra-ui/layout";

const displayUnit = (quantity, decimals = 6) => {
  return parseInt(quantity) / 10 ** decimals;
};

const hideZero = (str) =>
  str[str.length - 1] == 0 ? hideZero(str.slice(0, -1)) : str;

const UnitDisplay = ({
  quantity,
  decimals,
  symbol,
  hide,
  showQuantity,
  ...props
}) => {
  const num = displayUnit(quantity, decimals)
    .toLocaleString("en-EN", { minimumFractionDigits: decimals })
    .split(".")[0];
  const subNum = displayUnit(quantity, decimals)
    .toLocaleString("en-EN", { minimumFractionDigits: decimals })
    .split(".")[1];
  return (
    <Box {...props}>
      {quantity || quantity === 0 ? (
        showQuantity ? (
          <span style={{ marginRight: 12 }}>-</span>
        ) : (
          <>
            {num}
            {hide && hideZero(subNum).length <= 0 ? "" : "."}
            <span style={{ fontSize: "75%" }}>
              {hide ? hideZero(subNum) : subNum.slice(0, 2)}
            </span>{" "}
          </>
        )
      ) : (
        "... "
      )}
      {symbol}
    </Box>
  );
};

export default UnitDisplay;
