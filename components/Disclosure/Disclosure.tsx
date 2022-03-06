import * as React from "react";
import { Button } from "..";
import { Disclosure as D, Transition } from "@headlessui/react";
import { CommonProps } from "../../theme/common";
import { ArrowDownShort } from "@styled-icons/bootstrap/ArrowDownShort";

interface DisclosureProps extends CommonProps {
  children: JSX.Element | string;
  title: string;
  className?: string;
  classNameInner?: string;
  defaultOpen?: boolean;
}

export const Disclosure = (props: DisclosureProps) => {
  const [open, setOpen] = React.useState(props.defaultOpen);
  return (
    <D>
      <>
        <Button
          theme={props.theme}
          size={props.size}
          className={`w-full relative ${props.className}`}
          classNameInner={props.classNameInner}
          onClick={() => setOpen((o) => !o)}
        >
          <div className="px-8">{props.title}</div>
          <div
            className={`absolute h-full right-4 top-0 flex justify-center items-center ${
              open ? "tranform rotate-180" : ""
            }`}
          >
            <ArrowDownShort
              size={24}
              className={`stroke-1  ${
                props.theme === "white" ? "stroke-black" : "stroke-white"
              }`}
            />
          </div>
        </Button>

        {open && (
          <D.Panel className="mt-4" static>
            {props.children}
          </D.Panel>
        )}
      </>
    </D>
  );
};

Disclosure.defaultProps = {
  theme: "violet",
  size: "md",
  defaultOpen: false,
};
