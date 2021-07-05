import React from "react";
import Background from "../../images/assets/startButton.svg";
import style from "./StartButton.module.css";
import { Loading } from "@geist-ui/react";

import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { navigate } from "gatsby-link";

const StartButton = (props) => {
  const matches = useBreakpoint();
  const [loading, setLoading] = React.useState(false);

  return (
    <div
      className={style.startButton}
      style={{
        width: 100,
        height: 45,
        borderRadius: 25,
        fontWeight: 500,
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        border: "none",
        textAlign: "center",
        verticalAlign: "middle",
        lineHeight: "45px",

        zoom: matches.md && "0.85",
      }}
      onClick={() => {
        setLoading(true);
        window.cardano.enable().catch(() => setLoading(false));
      }}
    >
      {loading ? <Loading color="white" /> : "Connect"}
    </div>
  );
};

export default StartButton;
