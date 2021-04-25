import React from "react";
import Route from "./Route";
import { Redirect } from "react-router-dom";
// import auth from "./Auth";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={props => {
        if (/*auth.isAuthenticated()*/ true) {
          return <Component {...props} />;
        } else {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: props.location
                }
              }}
            />
          );
        }
      }}
    />
  );
};

export default ProtectedRoute;
