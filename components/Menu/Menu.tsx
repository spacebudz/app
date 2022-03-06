import * as React from "react";
import { Menu as M, Transition } from "@headlessui/react";

type MenuItem = {
  leftEl?: JSX.Element;
  name: string;
};

type MenuProps = {
  position?: "left" | "right" | "center";
  menuItems: MenuItem[];
  width?: "20" | "32" | "40" | "52";
  trigger: JSX.Element;
  className?: string;
};

const elementPositions = {
  left: "-left-1",
  right: "-right-1",
  center: "right-[50%] translate-x-[50%]",
};

const elementWidths = {
  20: "w-20",
  32: "w-32",
  40: "w-40",
  52: "w-52",
};

export const Menu = (props: MenuProps) => {
  return (
    <M as="div" className="relative inline-block text-right">
      <div>{props.trigger}</div>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <M.Items
          className={`${elementPositions[props.position]} ${
            ([props.width] && elementWidths[props.width]) || ""
          } z-40 absolute mt-1 bg-slate-600 text-white shadow-sm rounded-xl border-2 border-b-4 border-slate-700 divide-y divide-slate-200  ring-1 ring-black ring-opacity-5 focus:outline-none`}
        >
          <div className={`px-1 py-1 ${props.className || ""}`}>
            {props.menuItems.map(({ name, leftEl }, index) => (
              <M.Item key={index}>
                {({ active }) => (
                  <button
                    key={index}
                    className={`${
                      active && "bg-slate-500"
                    } group flex rounded-lg font-bold items-center w-full px-2 py-2 text-sm`}
                  >
                    {leftEl}
                    <div>{name}</div>
                  </button>
                )}
              </M.Item>
            ))}
          </div>
        </M.Items>
      </Transition>
    </M>
  );
};
