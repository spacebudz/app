const path = require("path");
const webpack = require("webpack");

exports.onCreateWebpackConfig = ({ stage, actions, loaders }) => {
  // Lucid Evolution (src/parts/spacebud/legacyCancel.ts, legacyMigrate.ts) and @noble/hashes
  // (legacyMigrate.ts) are only used in the browser, on click. Keep them out of the SSR
  // bundles, where they fail on "node:" imports ("Unhandled scheme").
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /[\\/](@lucid-evolution|@noble[\\/]hashes)[\\/]/,
            use: loaders.null(),
          },
        ],
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
