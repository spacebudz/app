import * as React from "react";
import { Listbox, Transition } from "@headlessui/react";
import { Selector } from "@styled-icons/heroicons-solid/Selector";

/* This component is currenty only used for the Explore page. Whenever there is more use for it, commonProps can be implemented */

type SelectionItem = {
  name: string;
  value: any;
};

type SelectProps = {
  options: SelectionItem[];
  value: SelectionItem;
  onChange: (SelectionItem) => void;
};

export const Select = (props: SelectProps) => {
  return (
    <div className="w-full">
      <Listbox value={props.value} onChange={props.onChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full pl-3 pr-10 text-left bg-white border-2 border-b-4 h-11  rounded-xl cursor-default focus:outline-none focus-visible:border-gray-400 font-semibold">
            <span className="block truncate">{props.value.name}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <Selector className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="z-10 absolute w-full py-1 mt-1 overflow-auto text-base bg-white border-2 border-b-4 border-gray-100 rounded-xl max-h-96 ring-1 ring-black ring-opacity-5 focus:outline-none text-md">
              {props.options.map((option, index) => (
                <Listbox.Option
                  key={index}
                  className={({ active }) =>
                    `cursor-default select-none relative py-2 pl-6 pr-4 ${
                      active ? "text-gray-900 bg-gray-100" : "text-black"
                    }`
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? "font-medium" : "font-normal"
                        }`}
                      >
                        {option.name}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
