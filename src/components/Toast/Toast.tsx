import * as React from "react";
import toast, { Toaster, resolveValue } from "react-hot-toast";
import { Transition } from "@headlessui/react";

type ToastProps = {
  theme?: "space" | "rose" | "violet";
  duration?: number;
  children: JSX.Element | string;
};

const elementThemes = {
  space: "border-slate-900 bg-slate-800 ",
  rose: "border-rose-600 bg-rose-500",
  violet: "border-violet-600 bg-primary",
};

export const createToast = ({
  theme = "violet",
  duration = 5000,
  children,
}: ToastProps) =>
  toast.custom(
    (t) => (
      <Transition
        appear
        show={t.visible}
        className={`${elementThemes[theme]} transform px-4 py-3 w-full md:w-[90%] md:max-w-xs rounded-xl text-white shadow-sm  border-2 border-b-4`}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div>{children}</div>
      </Transition>
    ),
    { duration }
  );

export { toast };

export const Toast = (props) => {
  React.useEffect(() => {
    setTimeout(() => toast.dismiss(), 4000);
  }, []);
  return (
    <>
      <button onClick={() => createToast({ children: <div>cool</div> })}>
        Open
      </button>
      {/* <Toaster position="bottom-right" /> */}
    </>
  );
};
