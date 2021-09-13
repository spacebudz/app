import React from "react";
import Layout from "./src/templates/layout";
import { Buffer } from "buffer";
if (typeof window !== "undefined") window.Buffer = Buffer;

// Pass all props (hence the ...props) to the layout component so it has access to things like pageContext or location
const wrapPageElement = ({ element, props }) => (
  <Layout {...props}>{element}</Layout>
);

export default wrapPageElement;
