const path = require("path");
const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ stage, actions, loaders }) => {
  // Lucid Evolution is only loaded in the browser (dynamic import in
  // src/parts/spacebud/legacyCancel.ts). Keep it out of the SSR bundles, where its
  // dependencies fail on "node:" imports ("Unhandled scheme").
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [{ test: /[\\/]@lucid-evolution[\\/]/, use: loaders.null() }],
      },
    });
  }

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
      new webpack.IgnorePlugin({
        resourceRegExp: /^electron$/,
      }),
    ],
    resolve: {
      fallback: {
        crypto: false,
        stream: require.resolve("stream-browserify"),
        assert: false,
        util: false,
        http: false,
        https: require.resolve("agent-base"),
        os: false,
        url: false,
      },
    },
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
