import React from "react";
import Icon from "@mdi/react";
import style from "./Tab.module.css";
import { Spacer, Popover } from "@geist-ui/react";
import { mdiMenuDown } from "@mdi/js";
import { useBreakpoint } from "gatsby-plugin-breakpoints";

const Tab = (props) => {
  const matches = useBreakpoint();

  return (
    <Popover {...props} content={props.menu} trigger="hover">
      <div className={style.tab}>
        <Icon path={props.icon} size={0.9} />
        {!matches.md && (
          <>
            <Spacer x={0.2} />
            <div>{props.children}</div>
            {props.menu && (
              <>
                <Spacer x={0.1} />
                <Icon path={mdiMenuDown} size={0.9} />{" "}
              </>
            )}
          </>
        )}
      </div>
    </Popover>
  );
};

export default Tab;
