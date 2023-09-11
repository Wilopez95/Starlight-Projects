require('dotenv');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = function override(config) {
  if (!config.plugins) {
    config.plugins = [];
  }

  if (!config.devServer) {
    config.devServer = {};
  }

  config.devServer.disableHostCheck = true;

  config.plugins.push(
    new CopyWebpackPlugin({
      patterns: [{ from: '../../node_modules/pdfjs-dist/build/pdf.worker.min.js' }],
    }),
  );
  config.plugins.push(new webpack.EnvironmentPlugin(['HAULING_FE_HOST', 'ENABLE_TEST_SCALES']));

  return config;
};
