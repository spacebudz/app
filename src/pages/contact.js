import React from "react";
import { LaunchButton } from "../components/Button";
import { Grid, Spacer } from "@geist-ui/react";

import Layout from "../templates/layout";
import Metadata from "../components/Metadata";

//assets
import BudRepresent from "../images/assets/spacebud.svg";
import { navigate } from "gatsby";
import { useBreakpoint } from "gatsby-plugin-breakpoints";

const Contact = (props) => {
  const matches = useBreakpoint();

  return (
    <>
      <Metadata
        titleTwitter="SpaceBudz: Collectible Astronauts"
        title="SpaceBudz"
        description="Collect your unique SpaceBud as NFT on the Cardano blockchain."
      />
      <Layout>
        <div style={{ minHeight: "100vh" }}>
          <div style={{ marginTop: 100 }}>Privacy Policy</div>
        </div>
      </Layout>
    </>
  );
};

export default Contact;
