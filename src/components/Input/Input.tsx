import * as React from "react";
import { commonProps, CommonProps } from "../../theme/common";

type CustomInputHTMLAttributes = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
>;

interface InputProps extends CustomInputHTMLAttributes, CommonProps {
  leftEl?: JSX.Element | string;
  rightEl?: JSX.Element | string;
  classNameContainer?: string;
}

const elementThemes = {
  violet: "bg-primary border-violet-600 placeholder:text-violet-300",
  slate: "bg-slate-600 border-slate-700 placeholder:text-slate-400",
  orange: "bg-orange-500 border-orange-600 placeholder:text-orange-300",
  rose: "bg-rose-500 border-rose-600 placeholder:text-rose-300",
  space: "bg-slate-800 border-slate-900 placeholder:text-slate-500",
  white: "!text-black",
};

const elementSizes = {
  xs: { inner: "px-2", outer: " text-xs  h-7" },
  sm: { inner: "px-2", outer: " text-sm h-9" },
  md: { inner: "px-2.5", outer: " text-md h-11" },
  lg: { inner: "px-3", outer: " text-lg h-14" },
};

export const Input = (props: InputProps) => {
  return (
    <div
      className={`${elementThemes[props.theme]} ${
        (props.disabled && "opacity-40 cursor-not-allowed") || ""
      } ${elementSizes[props.size].outer} group rounded-xl border-2 outline-none
              text-white border-b-4 font-semibold w-full
            overflow-hidden flex justify-center items-center ${
              props.classNameContainer || ""
            }`}
    >
      {props.leftEl && (
        <div className="ml-3 flex justify-center items-center">
          {props.leftEl}
        </div>
      )}
      <input
        {...props}
        className={`${elementThemes[props.theme]} ${
          elementSizes[props.size].inner
        }  w-full h-full outline-none text-inherit font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
          props.className || ""
        }`}
        size={0}
      />
      {props.rightEl && (
        <div className="mr-3 flex justify-center items-center">
          {props.rightEl}
        </div>
      )}
    </div>
  );
};

Input.defaultProps = commonProps;
