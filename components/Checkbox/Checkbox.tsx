import * as React from "react";
import { commonProps, CommonProps } from "../../theme/common";

type CustomInputHTMLAttributes = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
>;

interface CheckboxProps extends CustomInputHTMLAttributes, CommonProps {}

const elementThemes = {
  violet: "border-primary outline-primary after:bg-violet-400",
  slate: "border-slate-600 outline-slate-600 after:bg-slate-500",
  orange: "border-orange-500 outline-orange-500 after:bg-orange-400",
  rose: "border-rose-500 outline-rose-500 after:bg-rose-400",
};

const elementSizes = {
  xs: "w-3 h-3 rounded-[0.3rem] after:rounded-[0.2rem]",
  sm: "w-4 h-4  rounded-md after:rounded-[0.3rem]",
  md: "w-5 h-5 rounded-lg after:rounded-md",
  lg: "w-6 h-6 rounded-lg after:rounded-md",
};

export const Checkbox = (props: CheckboxProps) => {
  return (
    <input
      {...props}
      type="checkbox"
      size={20}
      className={`${elementThemes[props.theme]} ${
        elementSizes[props.size]
      } active:scale-90 cursor-pointer relative will-change-transform
      border-2 focus:outline-dashed
      text-white outline-offset-2
      duration-200 overflow-hidden
      after:w-full after:h-full after:top-0 
      after:left-0 after:absolute
      after:duration-300 after:transition-transform after:scale-[0]
      checked:after:scale-75
      disabled:opacity-40
      disabled:cursor-not-allowed ${props.className || ""}`}
    />
  );
};

Checkbox.defaultProps = commonProps;
