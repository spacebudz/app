import React from "react";
import Background from "../../images/assets/startButton.svg";
import style from "./StartButton.module.css";

import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { navigate } from "gatsby-link";

const StartButton = (props) => {
  const matches = useBreakpoint();

  return (
    <div
      className={style.startButton}
      style={{
        width: 85,
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
      onClick={() => navigate("/opening")}
    >
      Buy
    </div>
  );
};

export default StartButton;
