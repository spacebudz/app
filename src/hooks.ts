import * as React from "react";
import { getLucid } from "./utils";

export const useIsIntersecting = (ref: { current: any }, rootMargin: any) => {
  const [isIntersecting, setIntersecting] = React.useState(false);
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]: any) => setIntersecting(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin]);
  return isIntersecting;
};

export const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
