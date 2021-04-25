import React from "react";
import { GeistProvider, CssBaseline } from "@geist-ui/react";
import { StoreProvider } from "easy-peasy";
import store from "../store";
import theme from "../theme";
import Header from "../components/Header";
import Footer from "../components/Footer";

const Layout = (props) => {
  return (
    <StoreProvider store={store}>
      <GeistProvider theme={theme}>
        <CssBaseline />
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
      </GeistProvider>
    </StoreProvider>
  );
};

export default Layout;
