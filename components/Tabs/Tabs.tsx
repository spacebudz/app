/* This component is currently only used for Terms and conditions. To make it flexible adjustments are necessary */
import * as React from "react";
import { Tab } from "@headlessui/react";

type Category = {
  [key: string]: JSX.Element | string;
};

type TabsProps = {
  categories: Category;
};

export const Tabs = (props: TabsProps) => {
  return (
    <div className="w-full">
      <Tab.Group>
        <Tab.List className="flex p-1 space-x-1 bg-slate-300 rounded-xl">
          {Object.keys(props.categories).map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                `w-full py-2.5 text-sm leading-5 font-medium rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  selected
                    ? "bg-white text-primary"
                    : "text-white hover:bg-white/[0.12]"
                }`
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {Object.values(props.categories).map((content, key) => (
            <Tab.Panel
              key={key}
              className={"bg-white rounded-xl py-3 px-6 text-justify"}
            >
              {content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};
