const path = require('path');
const { extensions, plugins, loaders, aliases, output, shouldUseSourceMap } = require('./common');

module.exports = {
  mode: 'development',
  entry: [path.join(__dirname, '../src/main.tsx')],
  node: {
    __dirname: true,
    __filename: false,
    global: false,
  },
  target: ['browserslist'],

  bail: false,
  module: {
    rules: [
      loaders.sourceMap,
      loaders.typescript.development,
      loaders.js.development,
      loaders.scss.development,
      loaders.assets,
      loaders.css,
      loaders.svg,
    ],
  },
  resolve: {
    extensions,
    alias: aliases,
    fallback: { path: require.resolve('path-browserify') },
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].chunk.js',
    path: output,
    publicPath: '/',
    clean: true,
    assetModuleFilename: '[name].[hash][ext]', // static/media/
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  plugins: [
    plugins.circularDependency.development,
    plugins.env,
    plugins.provide,
    plugins.scssTypings,
    plugins.forkTs.development,
    plugins.clean,
    plugins.html,
    plugins.css,
    plugins.environmentVariables,
    plugins.progress,
  ],
  // devtool: 'inline-source-map', // NOTE - BAD Performance, GOOD debugging
  devtool: shouldUseSourceMap ? 'cheap-module-source-map' : false, // NOTE - SLOW Performance, GOOD debugging
  // devtool: 'eval', // NOTE - GOOD Performance, BAD debugging
  devServer: {
    hot: true,
    port: 7001,
    host: 'localhost',
    historyApiFallback: true,
    allowedHosts: ['localhost', '127.0.0.1'],
  },
  stats: {
    preset: 'errors-warning',
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
    backCompat: false,
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
