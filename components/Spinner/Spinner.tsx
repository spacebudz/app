import * as React from "react";
import { CommonProps } from "../../theme/common";
import { Circle } from "react-spinners-css";
import SpinnerIcon from "./spinner.svg";

interface SpinnerProps extends CommonProps {
  className?: string;
}

const elementThemes = {
  violet: "fill-primary stroke-primary",
  slate: "fill-slate-600 stroke-slate-600",
  orange: "fill-orange-500 stroke-orange-500",
  rose: "fill-rose-500 stroke-rose-500",
  white: "fill-white stroke-white",
};

const elementSizes = {
  xs: "scale-100",
  sm: "scale-125",
  md: "scale-150",
  lg: "scale-[175%]",
};

export const Spinner = (props: SpinnerProps) => {
  return (
    <div className={`${elementSizes[props.size]}`}>
      <div
        className={` ${
          elementThemes[props.theme]
        } animate-[spin_1.5s_linear_infinite] w-4 h-4 flex justify-center items-center ${
          props.className || ""
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 357.68 405.41">
          <g id="Layer_2" data-name="Layer 2">
            <g id="Layer_1-2" data-name="Layer 1">
              <circle cx="178.84" cy="202.7" r="65.53" />
              <circle
                className="fill-transparent stroke-[39px]"
                cx="178.84"
                cy="202.7"
                r="159.34"
              />
              <circle cx="178.84" cy="362.04" r="43.36" />
              <circle cx="178.84" cy="43.36" r="43.36" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

Spinner.defaultProps = { size: "md", theme: "white" };
