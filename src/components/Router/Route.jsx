import React from "react";
import { Route as ReactRoute } from "react-router-dom";

const Route = props => {
  React.useEffect(() => {
    document.title = props.title;
  });
  return <ReactRoute {...props} />;
};

export default Route;
