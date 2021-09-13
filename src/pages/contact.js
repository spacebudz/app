import React from "react";

import Metadata from "../components/Metadata";

//assets
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
      <div style={{ minHeight: "100vh" }}>
        <div style={{ marginTop: 100 }}>Privacy Policy</div>
      </div>
    </>
  );
};

export default Contact;
