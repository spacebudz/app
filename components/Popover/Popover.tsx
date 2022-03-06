import * as React from "react";
import { Popover as P, Transition } from "@headlessui/react";

type PopoverProps = {
  position?: "left" | "right" | "center";
  className?: string;
  trigger?: JSX.Element | string;
  children?: JSX.Element | JSX.Element[];
};

const elementPositions = {
  left: "md:top-6 md:-left-1 top-14 left-0",
  right: "md:top-6 md:-right-1 top-14 left-0 md:left-auto",
  center:
    "md:top-6 md:right-[50%] md:translate-x-[50%] top-14 left-0 md:left-auto",
};

export const Popover = (props: PopoverProps) => {
  const [open, setOpen] = React.useState(false);
  const el = React.useRef("");

  return (
    <div>
      <P className="md:relative">
        <>
          <button
            onClick={() => {
              el.current = "button";
              setOpen(true);
            }}
            onMouseEnter={() => {
              el.current = "button";
              setOpen(true);
            }}
            onMouseLeave={() =>
              setTimeout(() => el.current !== "popover" && setOpen(false))
            }
          >
            {props.trigger}
          </button>
          <Transition
            show={open}
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <P.Panel
              onMouseEnter={() => (el.current = "popover")}
              onMouseLeave={() =>
                setTimeout(() => el.current !== "button" && setOpen(false))
              }
              static
              className={`${
                elementPositions[props.position]
              } pt-5 absolute z-10 w-screen md:max-w-xs flex justify-center items-center ${
                props.className || ""
              }`}
            >
              <div className="overflow-hidden w-[90%] rounded-xl shadow-sm bg-white border-2 border-b-4 border-gray-200 ">
                <div className="p-4">{props.children}</div>
              </div>
            </P.Panel>
          </Transition>
        </>
      </P>
    </div>
  );
};
