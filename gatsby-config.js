const defaultTheme = require("tailwindcss/defaultTheme");
const { theme } = require("./src/theme/theme");

const tailwindQueries = {
  xs: `(max-width: ${defaultTheme.screens.xs})`,
  sm: `(max-width: ${defaultTheme.screens.sm})`,
  md: `(max-width: ${defaultTheme.screens.md})`,
  lg: `(max-width: ${defaultTheme.screens.lg})`,
  xl: `(max-width: ${defaultTheme.screens.xl})`,
  portrait: "(orientation: portrait)",
};

module.exports = {
  siteMetadata: {
    siteUrl: `https://spacebudz.io`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `SpaceBudz`,
        short_name: `SpaceBudz`,
        description:
          "Let's go on an adventure, where will your SpaceBudz take you?",
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: theme.colors.primary,
        display: `standalone`,
        icon: "src/images/icon.png",
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: `gatsby-plugin-ts`,
      options: {
        codegen: false,
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    `gatsby-plugin-postcss`,
    {
      resolve: "gatsby-plugin-breakpoints",
      options: {
        queries: tailwindQueries,
      },
    },
    "gatsby-plugin-use-query-params",
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: "data",
        path: `./src/data/`,
      },
    },
  ],
};
