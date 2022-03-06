import * as React from "react";
import { Dialog as D, Transition } from "@headlessui/react";

type DialogProps = {
  children: JSX.Element | string;
  position?: "center" | "top";
  width?: number | string;
  height?: number | string;
  fullscreen?: boolean;
  noOverlay?: boolean;
  className?: string;
  noAutoClose?: boolean;
  onClose?: () => void;
};

export const Dialog = React.forwardRef((props: DialogProps, ref) => {
  let [isOpen, setIsOpen] = React.useState(false);

  function closeModal() {
    setIsOpen(false);
    Boolean(props.onClose) && props.onClose();
  }

  function openModal() {
    setIsOpen(true);
  }

  React.useImperativeHandle(ref, () => ({
    open: () => openModal(),
    close: () => closeModal(),
  }));

  return (
    <>
      <Transition appear show={isOpen} as={React.Fragment}>
        <D
          className="fixed inset-0 z-10 will-change-auto"
          open={isOpen}
          onClose={() => {
            if (props.noAutoClose) return;
            closeModal();
          }}
        >
          <div className={`${props.fullscreen ? "" : "px-4"} text-center`}>
            {!props.noOverlay && (
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <D.Overlay className="fixed inset-0 backdrop-filter backdrop-blur-sm bg-opacity-40 bg-slate-900" />
              </Transition.Child>
            )}

            {/* This element is to trick the browser into centering the modal contents. */}
            <span
              className={`inline-block h-screen ${
                props.position === "top" ? "" : "align-middle"
              }`}
              aria-hidden="true"
            >
              &#8203;
            </span>
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div
                className={`${
                  props.fullscreen
                    ? ""
                    : "my-8 max-w-lg max-h-[80vh] rounded-xl"
                } inline-block w-full p-6 overflow-auto text-left align-middle transition-all transform bg-slate-800 shadow-sm border-2 border-b-4 border-slate-900 scrollbar-none text-white ${
                  props.className || ""
                }`}
                style={{ width: props.width, height: props.height }}
              >
                {props.children}
              </div>
            </Transition.Child>
          </div>
        </D>
      </Transition>
    </>
  );
});
