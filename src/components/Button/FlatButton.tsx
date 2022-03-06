import * as React from "react";
import { commonProps, CommonProps } from "../../theme/common";
import { Spinner } from "..";

interface FlatButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {
  loading?: boolean;
}

const elementThemes = {
  violet: {
    outer: "border-violet-600 bg-primary",
  },
  slate: {
    outer: "border-slate-700 bg-slate-600",
  },
  space: {
    outer: "border-slate-900 bg-slate-800",
  },
  orange: {
    outer: "border-orange-600 bg-orange-500",
  },
  rose: {
    outer: "border-rose-600 bg-rose-500",
  },
  white: {
    outer: "border-gray-200 bg-white text-slate-800",
  },
};

const elementSizes = {
  xs: {
    outer: "w-7 h-7 text-xs rounded-lg",
  },
  sm: {
    outer: "w-9 h-9 text-sm rounded-xl",
  },
  md: {
    outer: "w-11 h-11 text-md rounded-xl",
  },
  lg: {
    outer: "w-14 h-14 text-lg rounded-xl",
  },
};

export const FlatButton = (props: FlatButtonProps) => {
  const className = `${elementThemes[props.theme].outer} ${
    elementSizes[props.size].outer
  }  active:scale-95 duration-100   
             border-2 border-b-4 focus-visible:scale-[97%] outline-0
            text-white disabled:opacity-40 disabled:active:scale-100 disabled:cursor-not-allowed will-change-transform  ${
              props.className || ""
            }`;
  const buttonContent = () => (
    <div>
      <div>
        {props.loading && (
          <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center">
            <Spinner size={props.size} />
          </div>
        )}
        <div
          className={`${
            (props.loading && "opacity-0 pointer-events-none") || ""
          } font-bold`}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
  return (
    <button
      {...props}
      disabled={props.disabled || props.loading}
      className={className}
    >
      {buttonContent()}
    </button>
  );
};

FlatButton.defaultProps = commonProps;
