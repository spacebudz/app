import { extendTheme } from "@chakra-ui/react";
import "focus-visible/dist/focus-visible";

const Switch = {
  baseStyle: {
    track: {
      _focus: {
        boxShadow: "none",
      },
    },
  },
  defaultProps: {
    colorScheme: "purple",
  },
};

const theme = {
  components: {
    Switch,
  },
};

export default extendTheme(theme);
