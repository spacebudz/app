import React from "react";
import { Switch, Router as ReactRouter } from "react-router-dom";
import { createBrowserHistory } from "history";

const Router = props => {
  const history = createBrowserHistory();
  return (
    <ReactRouter history={history}>
      <Switch>{props.children}</Switch>
    </ReactRouter>
  );
};

export default Router;
