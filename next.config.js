const webpack = require("webpack");

module.exports = {
  reactStrictMode: false,
  webpack: (config) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        CESIUM_BASE_URL: JSON.stringify("/cesium"),
      }),
    );
    return config;
  },
};
