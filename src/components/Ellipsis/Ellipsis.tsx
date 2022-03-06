import * as React from "react";
import Truncate from "react-truncate-string";

type EllipsisProps = {
  children: string;
  className?: string;
};

export const Ellipsis = (props: EllipsisProps) => {
  return (
    <div
      style={{
        whiteSpace: "nowrap",
      }}
      className={props.className}
    >
      <Truncate text={props.children} />
    </div>
  );
};
