import * as React from "react";
import { Button } from "../../components";
import { Close } from "@styled-icons/evaicons-solid/Close";

export const SpecialButton = ({
  disabledMessage = null,
  cancel = null,
  children,
  theme,
  onClick,
  className = "",
}) => {
  return (
    <div className="flex flex-col justify-start">
      {cancel ? (
        <div className={`flex justify-center items-center`}>
          <Button
            data-bs-toggle="tooltip"
            data-bs-placement="bottom"
            title="Tooltip on bottom"
            className={className}
            theme={theme}
            onClick={onClick}
            disabled={Boolean(disabledMessage)}
          >
            {children}
          </Button>
          <Button theme={theme} onClick={cancel} className="ml-1 w-11">
            <Close size={22} className="stroke-white stroke-1" />
          </Button>
        </div>
      ) : (
        <Button
          className={className}
          theme={theme}
          onClick={onClick}
          disabled={Boolean(disabledMessage)}
        >
          {children}
        </Button>
      )}

      {Boolean(disabledMessage) && (
        <div className="max-w-fit mt-2 text-gray-500 leading-5 font-light">
          {disabledMessage}
        </div>
      )}
    </div>
  );
};
