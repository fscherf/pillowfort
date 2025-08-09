const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    app: "./src/entry/app.tsx",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_debugger: false,
            drop_console: false,
          },
        },
      }),
    ],
  },
};
