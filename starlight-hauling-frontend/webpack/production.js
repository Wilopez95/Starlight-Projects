const path = require('path');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');
const pkg = require('../package.json');
const { extensions, plugins, loaders, aliases, output } = require('./common');

module.exports = {
  mode: 'production',
  entry: [path.join(__dirname, '../src/main.tsx')],
  node: {
    __dirname: true,
    __filename: false,
    global: false,
  },
  module: {
    rules: [
      loaders.typescript.production,
      loaders.js.production,
      loaders.scss.production,
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
    filename: '[name].[contenthash:5].js',
    chunkFilename: '[name].[contenthash:5].chunk.js',
    path: output,
    publicPath: '/',
  },
  plugins: [
    plugins.circularDependency.production,
    plugins.env,
    plugins.forkTs.production,
    plugins.clean,
    plugins.html,
    plugins.css,
    plugins.scssTypings,
    plugins.environmentVariables,
    new SentryWebpackPlugin({
      include: '.',
      ignoreFile: '.sentrycliignore',
      ignore: ['node_modules', 'webpack', 'cypress', 'assets'],
      configFile: '.sentryclirc',
      authToken: '90694a6e2943464db39cee0da7b3519a6aa316c6521f488f9f010823a792bf2b',
      dryRun: process.env.SENTRY_DRY_RUN === 'true',
      release: `hauling-frontend@${pkg.version}`,
      project: 'hauling-frontend',
      org: 'starlightpro',
      setCommits: {
        auto: true,
      },
      deploy: {
        env: process.env.NODE_ENV,
      },
    }),
    {
      apply: compiler => {
        compiler.hooks.done.tap('DonePlugin', stats => {
          console.log('Compile is done !');
          setTimeout(() => {
            process.exit(0);
          });
        });
      },
    },
  ],
  target: 'browserslist',
  devtool: 'source-map',
  stats: {
    assetsSort: '!size',
    children: false,
    usedExports: false,
    modules: false,
    entrypoints: false,
    excludeAssets: [/\.*\.map/],
  },
  cache: {
    type: 'filesystem',
    allowCollectingMemory: true,
    memoryCacheUnaffected: true,
    compression: 'gzip',
  },
  performance: {
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  optimization: {
    moduleIds: 'deterministic',
    splitChunks: {
      chunks: 'all',
      // minSize: 5000,
      // maxSize: 300000,

      cacheGroups: {
        styles: {
          type: 'css/mini-extract',
          filename: '[chunkhash:8].css',
          // priority: 100,
          // maxSize: 50000,
          // minSizeReduction: 50000,
          // enforce: true,
        },
        vendor: {
          chunks: 'all',
          test: /[\\/]node_modules[\\/]/,
          filename: '[chunkhash:8].js',
          enforce: true,
          reuseExistingChunk: true,
        },
        // utils: {
        //   chunks: 'all',
        //   test: /[\\/]utils[\\/]/,
        //   filename: '[chunkhash:8].js',
        //   reuseExistingChunk: true,
        //   minSize: 10000,
        //   maxSize: 100000,
        // },
        // provider: {
        //   chunks: 'all',
        //   test: /[\\/]provider[\\/]/,
        //   filename: '[chunkhash:8].js',
        //   reuseExistingChunk: true,
        //   minSize: 10000,
        //   maxSize: 100000,
        // },
      },
    },
    minimize: true,
    minimizer: [plugins.terser, plugins.optimizeCss],
  },
  experiments: {
    backCompat: false,
    cacheUnaffected: true,
  },
  // optimization: {
  //   noEmitOnErrors: true,
  //   minimizer: [plugins.terser, plugins.optimizeCss],
  //   sideEffects: true,
  //   runtimeChunk: 'single',
  //   moduleIds: 'hashed',
  //   splitChunks: {
  //     cacheGroups: {
  //       css: {
  //         test: /\.s?css$/,
  //         chunks: 'all',
  //       },
  //       vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         chunks: 'all',
  //       },
  //     },
  //     chunks: 'all',
  //   },
  // },
};
