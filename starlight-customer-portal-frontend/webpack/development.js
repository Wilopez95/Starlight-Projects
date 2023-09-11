const path = require('path');
const { extensions, plugins, loaders, aliases, output } = require('./common');

module.exports = {
  mode: 'development',
  entry: [path.join(__dirname, '../src/main.tsx')],
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      loaders.typescript.development,
      loaders.scss.development,
      loaders.assets,
      loaders.css,
      loaders.svg,
    ],
  },
  resolve: {
    extensions,
    alias: aliases,
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    path: output,
    publicPath: '/',
  },
  plugins: [
    plugins.circularDependency.development,
    plugins.scssTypings,
    plugins.forkTs.development,
    plugins.clean,
    plugins.html,
    plugins.css,
    plugins.environmentVariables,
    plugins.progress,
  ],
  devtool: 'eval-source-map',
  devServer: {
    hot: true,
    port: 7002,
    host: 'localhost',
    historyApiFallback: true,
    disableHostCheck: true,
  },
  optimization: {
    noEmitOnErrors: true,
  },
};
