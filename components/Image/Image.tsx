import * as React from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

interface ImageProps extends React.HTMLAttributes<HTMLImageElement> {
  src: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  threshold?: number;
  scrollPosition?: any;
}

export const Image = (props: ImageProps) => {
  return (
    <LazyLoadImage
      src={props.src}
      width={props.width ? props.width : "100%"}
      height={props.height ? props.height : "100%"}
      effect="blur"
      threshold={props.threshold}
      className={props.className}
      scrollPosition={props.scrollPosition}
    />
  );
};
