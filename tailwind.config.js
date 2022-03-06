const { theme } = require("./src/theme/theme");

module.exports = {
  future: {
    // removeDeprecatedGapUtilities: true,
    // purgeLayersByDefault: true,
  },
  content: ["./src/**/*.{js,jsx,ts,tsx,vue}", "./public/**/*.html"],
  theme: {
    extend: theme,
  },
  plugins: [],
};
