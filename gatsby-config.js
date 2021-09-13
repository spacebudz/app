module.exports = {
  plugins: [
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sass`,
    `gatsby-plugin-styled-components`,
    `gatsby-plugin-react-helmet`,
    `@chakra-ui/gatsby-plugin`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/src/images/`,
      },
    },
    {
      resolve: "gatsby-plugin-breakpoints",
      options: {
        queries: {
          xs: "(max-width: 650px)",
          sm: "(max-width: 900px)",
          md: "(max-width: 1280px)",
          l: "(max-width: 1920px)",
          xl: "(max-width: 10000px)",
          portrait: "(orientation: portrait)",
        },
      },
    },
  ],
};
