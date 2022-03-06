const path = require("path");
const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ stage, actions }) => {
  actions.setWebpackConfig({
    experiments: {
      asyncWebAssembly: true,
      topLevelAwait: true,
    },
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
    ],
  });
};

exports.createPages = async ({ actions: { createPage } }) => {
  [...Array(10000)].forEach((_, budId) => {
    createPage({
      path: `/spacebud/${budId}`,
      component: require.resolve("./src/templates/spacebud.tsx"),
      context: { budId },
    });
  });
};
