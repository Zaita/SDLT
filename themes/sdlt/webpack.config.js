const path = require("path");
const webpack = require("webpack");

module.exports = (env, argv) => {
  // Detect mode on runtime
  const mode = argv.mode || "production";

  return {
    entry: {
      common: ["whatwg-fetch", "./src/js/common.js"],
      main: ["whatwg-fetch", "./src/js/main.js"]
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
              [
                "@babel/preset-env", {
                "useBuiltIns": "entry",
                "targets": {
                  "browsers": ["last 2 versions", "ie >= 11"],
                },
              }],
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
        {
          test: /\.(woff|woff2|eot|ttf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                outputPath: "../font",
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
