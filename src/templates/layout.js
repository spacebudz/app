import React from "react";
import { StoreProvider } from "easy-peasy";
import store from "../store";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = (props) => {
  return (
    <StoreProvider store={store}>
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%" }}>
          <Header />
          {props.children}
          <Footer />
        </div>
      </div>
    </StoreProvider>
  );
};

export default Layout;
