import * as React from "react";
import { commonProps, CommonProps } from "../../theme/common";

type CustomInputHTMLAttributes = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
>;

interface SwitchProps extends CustomInputHTMLAttributes, CommonProps {}

const elementThemes = {
  violet:
    "border-primary outline-primary after:bg-violet-400 checked:bg-violet-400",
  slate:
    "border-slate-600 outline-slate-600 after:bg-slate-500 checked:bg-slate-500",
  orange:
    "border-orange-500 outline-orange-500 after:bg-orange-400 checked:bg-orange-400",
  rose: "border-rose-500 outline-rose-500 after:bg-rose-400 checked:bg-rose-400",
};

const elementSizes = {
  xs: "w-6 h-3 rounded-[0.3rem] after:rounded-[0.2rem] checked:after:translate-x-6  after:-left-3",
  sm: "w-8 h-4 rounded-md after:rounded-[0.3rem] checked:after:translate-x-8  after:-left-4",
  md: "w-10 h-5 rounded-lg after:rounded-md checked:after:translate-x-10  after:-left-5",
  lg: "w-11 h-6 rounded-xl after:rounded-lg checked:after:translate-x-10  after:-left-5",
};

export const Switch = (props: SwitchProps) => {
  return (
    <input
      {...props}
      type="checkbox"
      size={20}
      className={`${elementThemes[props.theme]} ${
        elementSizes[props.size]
      } relative cursor-pointer will-change-transform
                rounded-lg border-2 focus:outline-dashed
                 text-white  outline-offset-2
                duration-200 overflow-hidden
                checked:after:bg-white
                after:w-full after:h-full
                 after:absolute after:scale-y-90
                after:duration-500 after:transition after:ease-in-out
                after:rounded-md disabled:opacity-40
                disabled:cursor-not-allowed`}
    />
  );
};

Switch.defaultProps = commonProps;
