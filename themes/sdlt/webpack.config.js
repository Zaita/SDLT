const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
  // Detect mode on runtime
  const mode = argv.mode || "production";

  return {
    entry: {
      common: "./src/js/common.js",
      main: "./src/js/main.js",
    },
    mode: mode,
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", {"useBuiltIns": "entry"}],
              "@babel/preset-react",
              "@babel/preset-flow",
            ],
            plugins: [
              ["@babel/plugin-proposal-class-properties", {"loose": true}]
            ]
          },
        },
        {
          test: /\.(scss|css)$/,
          loaders: ["style-loader", "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: "../img",
              },
            },
          ],
        },
      ],
    },
    resolve: {extensions: ["*", ".js", ".jsx"]},
    output: {
      path: path.resolve(__dirname, "./dist/js"),
      hotUpdateChunkFilename: "hot/hot-update.js",
      hotUpdateMainFilename: "hot/hot-update.json",
      publicPath: "/resources/themes/sdlt/dist/img/",
      filename: "[name].bundle.js",
      chunkFilename: "[name].bundle.js",
    },
    optimization: {
      minimize: mode !== "development",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
        name: (module, chunks, cacheGroupKey) => {
          return `${cacheGroupKey}`;
        },
      },
    },
    devtool: "source-map",
    performance: {
      maxEntrypointSize: 400000,
      assetFilter: (assetFilename) => {
        return assetFilename.endsWith(".js") && assetFilename !== "vendors.bundle.js";
      },
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
    ],
  }
};
