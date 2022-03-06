/* Radio group works for now only under the profile page. Whenever necessary it can be made more modular. */

import * as React from "react";
import { RadioGroup as R } from "@headlessui/react";

type RadioItem = {
  name: string;
  content: JSX.Element | string;
  index: number;
};

type RadioGroupProps = {
  items: RadioItem[];
  selected: number;
  onChange: (index: number) => void;
};

export const RadioGroup = (props: RadioGroupProps) => {
  return (
    <div className="w-full">
      <div className="w-full">
        <R
          value={props.items[props.selected]}
          onChange={(item) => props.onChange(item.index)}
        >
          <R.Label className="sr-only">Server size</R.Label>
          <div className="space-y-2">
            {props.items.map((item) => (
              <R.Option
                key={item.name}
                value={item}
                className={({ active, checked }) =>
                  `${
                    checked
                      ? "bg-primary border-violet-600 text-white"
                      : "bg-white"
                  }
                      relative rounded-xl px-5 py-4 cursor-pointer flex focus:outline-none border-2 border-b-4 focus-visible:border-violet-400/80`
                }
              >
                {({ active, checked }) => (
                  <>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <div className="text-md">
                          <R.Label
                            as="p"
                            className={`font-semibold text-xl  ${
                              checked ? "text-white" : "text-black"
                            }`}
                          >
                            {item.name}
                          </R.Label>
                          <R.Description
                            as="span"
                            className={`inline ${
                              checked ? "text-white" : "text-slate-500"
                            }`}
                          >
                            {item.content}
                          </R.Description>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </R.Option>
            ))}
          </div>
        </R>
      </div>
    </div>
  );
};
