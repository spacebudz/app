import React from "react";
import { StoreProvider } from "./src/layouts/storeProvider";

// eslint-disable-next-line react/display-name,react/prop-types
const WrapComponent = ({ element }) => {
  return <StoreProvider>{element}</StoreProvider>;
};

export default WrapComponent;
