import { mdiChevronUp } from "@mdi/js";
import Icon from "@mdi/react";
import React from "react";

const FloatingButton = (props) => {
  const [scrollPos, setScrollPos] = React.useState(0);
  const handleScroll = () => setScrollPos(window.scrollY);
  React.useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    scrollPos > 250 && (
      <div
        {...props}
        style={{
          zIndex: 1,
          cursor: "pointer",
          position: "fixed",
          right: 40,
          bottom: 40,
          width: 40,
          color: "white",
          height: 40,
          borderRadius: "50%",
          background: props.bgcolor || "#4a148c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon path={mdiChevronUp} size={1} />
      </div>
    )
  );
};

export default FloatingButton;
