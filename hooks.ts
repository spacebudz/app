import * as React from "react";

export const useIsIntersecting = (ref, rootMargin) => {
  const [isIntersecting, setIntersecting] = React.useState(false);
  const observer = new IntersectionObserver(
    ([entry]: any) => setIntersecting(entry.isIntersecting),
    { rootMargin }
  );
  React.useEffect(() => {
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, []);
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
