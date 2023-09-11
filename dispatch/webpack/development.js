const path = require('path');
const { extensions, plugins, loaders, aliases, output } = require('./common');

module.exports = {
  mode: 'development',
  entry: [path.join(__dirname, '../src/index.tsx')],
  node: {
    __dirname: true,
    __filename: false,
    global: false,
  },
  module: {
    rules: [
      loaders.typescript.development,
      loaders.scss.development,
      loaders.assets,
      loaders.css,
      loaders.svg,
      loaders.javascript.production,
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
    clean: true,
  },
  plugins: [
    plugins.circularDependency.development,
    plugins.environmentVariables,
    plugins.provide,
    plugins.scssTypings,
    plugins.forkTs.development,
    plugins.env,
    plugins.html,
    plugins.css,
    plugins.progress,
  ],
  // devtool: 'inline-source-map', // NOTE - BAD Performance, GOOD debugging
  devtool: 'eval-cheap-module-source-map', // NOTE - SLOW Performance, GOOD debugging
  // devtool: 'eval', // NOTE - GOOD Performance, BAD debugging
  devServer: {
    hot: true,
    port: 7002,
    host: 'localhost',
    historyApiFallback: true,
    allowedHosts: ['localhost', '127.0.0.1'],
  },

  stats: {
    preset: 'errors-only',
    all: false,
  },

  cache: {
    // NOTE - Type memory
    type: 'memory',
    cacheUnaffected: true,
  },

  optimization: {
    runtimeChunk: false,
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
    sideEffects: false,
    emitOnErrors: false,
    providedExports: false,
  },
  experiments: {
    lazyCompilation: {
      imports: true,
      entries: true,
      test: module =>
        !/[\\/](node_modules|src\/(utils|config|assets))[\\/]/.test(module.nameForCondition()),
    },
    layers: true,
    cacheUnaffected: true,
  },
};
