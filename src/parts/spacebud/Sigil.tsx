import * as React from "react";
import { sigil, reactRenderer } from "@tlon/sigil-js";

export const Sigil = ({ patp, size }: { patp: string; size: number }) => {
  return (
    <div className="rounded-md overflow-hidden w-fit">
      {(() => {
        try {
          return sigil({
            patp,
            renderer: reactRenderer,
            size: size,
            colors: ["black", "white"],
          });
        } catch (e) {
          return <div className="w-10 h-10 bg-black"></div>;
        }
      })()}
    </div>
  );
};
