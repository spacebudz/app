import * as React from "react";
import { commonProps, CommonProps } from "../../theme/common";
import { Spinner } from "..";
import { Menu as M, Popover as P } from "@headlessui/react";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    CommonProps {
  loading?: boolean;
  leftEl?: JSX.Element | string;
  rightEl?: JSX.Element | string;
  menu?: boolean;
  popover?: boolean;
  classNameInner?: string;
}

const elementThemes = {
  violet: {
    outer: "bg-violet-600",
    inner: "border-violet-600 bg-primary",
  },
  slate: {
    outer: "bg-slate-700",
    inner: "border-slate-700 bg-slate-600",
  },
  space: {
    outer: "bg-slate-900",
    inner: "border-slate-900 bg-slate-800",
  },
  orange: {
    outer: "bg-orange-600",
    inner: "border-orange-600 bg-orange-500",
  },
  rose: {
    outer: "bg-rose-600",
    inner: "border-rose-600 bg-rose-500",
  },
  white: {
    outer: "bg-gray-200",
    inner: "border-gray-200 bg-white text-black",
  },
};

const elementSizes = {
  xs: {
    outer: "h-7 text-sm py-2 px-3",
    left: "mr-1",
    right: "ml-1",
  },
  sm: {
    outer: "h-9 text-md py-2 px-4",
    left: "mr-2",
    right: "ml-2",
  },
  md: {
    outer: "h-11 text-md py-3 px-4",
    left: "mr-3",
    right: "ml-3",
  },
  lg: {
    outer: "h-14 text-lg py-4 px-6",
    left: "mr-3",
    right: "ml-3",
  },
};

export const Button = (props: ButtonProps) => {
  const className = `${elementThemes[props.theme].outer} group rounded-xl
            outline-none
            text-white disabled:opacity-40 disabled:cursor-not-allowed will-change-transform ${
              props.className || ""
            }`;
  const buttonContent = () => (
    <div
      className={`${elementThemes[props.theme].inner} ${
        elementSizes[props.size].outer
      } overflow-hidden -translate-y-1
            rounded-xl border-2 font-bold
            py-3 duration-200 group-focus:-translate-y-1.5 group-hover:-translate-y-1.5 group-active:-translate-y-0.5
            group-active:duration-100 group-disabled:pointer-events-none group-disabled:group-hover:-translate-y-1 flex flex-row items-center justify-center ${
              props.classNameInner || ""
            }`}
    >
      {props.leftEl && (
        <div className={elementSizes[props.size].left}>
          <div
            className={`${
              (props.loading && "opacity-0 pointer-events-none") || ""
            }`}
          >
            {props.leftEl}
          </div>
        </div>
      )}

      <div>
        {props.loading && (
          <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center">
            <Spinner size={props.size} />
          </div>
        )}
        <div
          className={`${
            (props.loading && "opacity-0 pointer-events-none") || ""
          }`}
        >
          {props.children}
        </div>
      </div>
      {props.rightEl && (
        <div className={elementSizes[props.size].right}>
          <div
            className={`${
              (props.loading && "opacity-0 pointer-events-none") || ""
            }`}
          >
            {props.rightEl}
          </div>
        </div>
      )}
    </div>
  );
  return props.menu ? (
    <M.Button {...props} className={className}>
      {buttonContent()}
    </M.Button>
  ) : props.popover ? (
    <P.Button {...props} className={className}>
      {buttonContent()}
    </P.Button>
  ) : (
    <button
      {...props}
      disabled={props.disabled || props.loading}
      className={className}
    >
      {buttonContent()}
    </button>
  );
};

Button.defaultProps = commonProps;
