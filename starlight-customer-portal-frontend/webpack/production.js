const path = require('path');
const { extensions, plugins, loaders, aliases, output } = require('./common');

module.exports = {
  mode: 'production',
  entry: [path.join(__dirname, '../src/main.tsx')],
  node: {
    fs: 'empty',
  },
  module: {
    rules: [
      loaders.typescript.production,
      loaders.scss.production,
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
    filename: '[name].[contenthash:5].js',
    chunkFilename: '[name].[contenthash:5].chunk.js',
    path: output,
    publicPath: '/',
  },
  plugins: [
    plugins.circularDependency.production,
    plugins.forkTs.production,
    plugins.clean,
    plugins.html,
    plugins.css,
    plugins.scssTypings,
    plugins.environmentVariables,
  ],
  devtool: false,
  optimization: {
    noEmitOnErrors: true,
    minimizer: [plugins.terser, plugins.optimizeCss],
    sideEffects: true,
    runtimeChunk: 'single',
    moduleIds: 'hashed',
    splitChunks: {
      cacheGroups: {
        css: {
          test: /\.s?css$/,
          chunks: 'all',
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
        },
      },
      chunks: 'all',
    },
  },
};
