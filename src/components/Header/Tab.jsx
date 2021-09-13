import React from "react";
import Icon from "@mdi/react";
import * as style from "./Tab.module.css";
// import { Spacer, Popover } from "@geist-ui/react";
import { mdiMenuDown } from "@mdi/js";
import { useBreakpoint } from "gatsby-plugin-breakpoints";
import { Box } from "@chakra-ui/layout";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { Button, Link } from "@geist-ui/react";

const Tab = (props) => {
  const matches = useBreakpoint();
  const { onOpen, onClose, isOpen } = useDisclosure();

  return props.menu ? (
    <Popover
      {...props}
      matchWidth
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      trigger="click"
    >
      <PopoverTrigger>
        <button>
          <div className={style.tab}>
            <Icon path={props.icon} size={0.9} />
            {!matches.md && (
              <>
                <Box w={3} />
                <div>{props.children}</div>
                {props.menu && (
                  <>
                    <Box w={1} />
                    <Icon path={mdiMenuDown} size={0.9} />{" "}
                  </>
                )}
              </>
            )}
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent width="full">
        <PopoverBody>{props.menu(() => onClose())}</PopoverBody>
      </PopoverContent>
    </Popover>
  ) : (
    <div className={style.tab} onClick={props.onClick}>
      <Icon path={props.icon} size={0.9} />
      {!matches.md && (
        <>
          <Box w={3} />
          <div>{props.children}</div>
          {props.menu && (
            <>
              <Box w={1} />
              <Icon path={mdiMenuDown} size={0.9} />{" "}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Tab;
