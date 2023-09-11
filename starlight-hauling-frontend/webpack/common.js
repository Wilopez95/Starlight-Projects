/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-unsafe-call */
const path = require('path');
const resolve = require('resolve');

const webpack = require('webpack');
const dotenv = require('dotenv');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const StyledComponentsPlugin = require('typescript-plugin-styled-components').default;
const Dotenv = require('dotenv-webpack');
const pkg = require('../package.json');

const imageInlineSizeLimit = 10000;
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const hasJsxRuntime = (() => {
  if (process.env.DISABLE_NEW_JSX_TRANSFORM === 'true') {
    return false;
  }

  try {
    require.resolve('react/jsx-runtime');
    return true;
  } catch (e) {
    return false;
  }
})();

dotenv.config({
  // eslint-disable-next-line
  path: `webpack/env/.env.${process.env.NODE_ENV}`,
});

const loaders = {
  // Handle node_modules packages that contain sourcemaps
  sourceMap: shouldUseSourceMap && {
    enforce: 'pre',
    exclude: /@babel(?:\/|\\{1,2})runtime/,
    test: /\.(js|mjs|jsx|ts|tsx|css)$/,
    loader: require.resolve('source-map-loader'),
  },
  js: {
    development: {
      test: /\.js$/,
      exclude: /@babel(?:\/|\\{1,2})runtime/,
      use: {
        loader: 'babel-loader',
        options: {
          babelrc: false,
          configFile: false,
          compact: false,
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                corejs: '3.29.0',
                shippedProposals: true,
                bugfixes: true,
              },
            ],
            [
              '@babel/preset-react',
              {
                runtime: 'automatic',
              },
            ],
          ],
          cacheDirectory: true,
          // See #6846 for context on why cacheCompression is disabled
          cacheCompression: false,

          // Babel sourcemaps are needed for debugging into node_modules
          // code.  Without the options below, debuggers like VSCode
          // show incorrect code and set breakpoints on the wrong lines.
          sourceMaps: shouldUseSourceMap,
          inputSourceMap: shouldUseSourceMap,
        },
      },
    },
    production: {
      test: /\.js$/,
      exclude: /@babel(?:\/|\\{1,2})runtime/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                useBuiltIns: 'entry',
                corejs: '3.29.0',
                shippedProposals: true,
                bugfixes: true,
              },
            ],
            [
              '@babel/preset-react',
              {
                runtime: 'automatic',
              },
            ],
          ],
          plugins: [],
        },
      },
    },
  },
  typescript: {
    development: {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /[\\/]node_modules[\\/]/,
      options: {
        transpileOnly: true,
        getCustomTransformers: () => ({
          before: [
            StyledComponentsPlugin({
              ssr: false,
              displayName: true,
            }),
          ],
        }),
      },
    },
    production: {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /[\\/]node_modules[\\/]/,
      options: {
        transpileOnly: true,
        getCustomTransformers: () => ({
          before: [
            StyledComponentsPlugin({
              minify: true,
              ssr: false,
              displayName: false,
            }),
          ],
        }),
      },
    },
  },
  scss: {
    development: {
      test: /\.s[ac]ss$/i,
      use: [
        { loader: 'style-loader' },
        '@teamsupercell/typings-for-css-modules-loader',
        {
          loader: 'css-loader',
          options: {
            modules: {
              localIdentName: '[local]-[contenthash:5]',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: ['postcss-preset-env', 'autoprefixer'],
            },
          },
        },
        'resolve-url-loader',
        {
          loader: 'sass-loader',
          options: {
            // Prefer `dart-sass`
            sourceMap: true,
            implementation: require('sass'),
            sassOptions: {
              fiber: false,
            },
          },
        },
      ],
    },
    production: {
      test: /\.s[ac]ss$/i,
      use: [
        {
          loader: MiniCssExtractPlugin.loader,
          options: {
            esModule: true,
          },
        },
        '@teamsupercell/typings-for-css-modules-loader',

        {
          loader: 'css-loader',
          options: {
            importLoaders: 3,
            modules: {
              localIdentName: '[local]-[contenthash:5]',
            },
          },
        },
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: ['postcss-preset-env', 'autoprefixer'],
            },
          },
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            implementation: require('sass'),
            sassOptions: {
              fiber: false,
            },
          },
        },
      ],
    },
  },
  css: {
    test: /\.css$/,
    // include: /[\\/]node_modules[\\/]/,
    use: [
      {
        loader: MiniCssExtractPlugin.loader,
        options: {
          esModule: true,
        },
      },
      'css-loader',
    ],
  },
  svg: {
    test: /\.svg$/i,
    issuer: /\.[jt]sx?$/,
    use: ['@svgr/webpack'],
  },
  assets: {
    test: /\.svg$|\.png$|\.md$|\.jpe?g$/,
    oneOf: [
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.svg$/,
        issuer: { and: [/\.s?css$/] },
        use: [
          {
            loader: require.resolve('@svgr/webpack'),
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: require.resolve('file-loader'),
            options: {
              name: '[name].[hash].[ext]',
            },
          },
        ],
      },
    ],
  },
};

const plugins = {
  forkTs: {
    development: new ForkTsCheckerWebpackPlugin(),
    production: new ForkTsCheckerWebpackPlugin({
      async: false,
    }),
  },
  circularDependency: {
    development: new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
    production: new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
    }),
  },
  html: new HtmlWebpackPlugin({
    template: path.resolve(__dirname, '../assets/index.html'),
    favicon: path.resolve(__dirname, '../assets/favicon.ico'),
    scriptLoading: 'defer',
    exagoUrl: process.env.EXAGO_BACKEND_URL,
    minify: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: false,
      useShortDoctype: true,
    },
  }),
  clean: new CleanWebpackPlugin(),
  css: new MiniCssExtractPlugin({
    filename: '[name].[contenthash:5].css',
    chunkFilename: '[id].[contenthash:5].css',
  }),
  terser: new TerserWebpackPlugin({
    parallel: 4,
    extractComments: 'all',
  }),
  optimizeCss: new CssMinimizerPlugin({
    exclude: /node_modules/,
    parallel: 4,

    minify: [
      // CssMinimizerPlugin.esbuildMinify,
      CssMinimizerPlugin.cssnanoMinify,
      CssMinimizerPlugin.cssoMinify,
      CssMinimizerPlugin.cleanCssMinify,
    ],
  }),
  scssTypings: new webpack.WatchIgnorePlugin({
    paths: [/\.scss\.d\.ts$/],
  }),
  env: new Dotenv({
    path: `webpack/env/.env.${process.env.NODE_ENV}`,
  }),
  environmentVariables: new webpack.EnvironmentPlugin({
    npm_package_version: pkg.version,
  }),
  progress: new webpack.ProgressPlugin(),
  provide: new webpack.ProvidePlugin({
    process: 'process/browser.js',
    path: require.resolve('path-browserify'),
  }),
};

const aliases = {
  '@root': path.resolve(__dirname, '../src'),
  '@hooks': path.resolve(__dirname, '../src/hooks'),
  '@assets': path.resolve(__dirname, '../assets'),
  // following aliases solve problem with yarn link: https://styled-components.com/docs/faqs#how-can-i-fix-issues-when-using-npm-link-or-yarn-link
  react: path.resolve(__dirname, '../node_modules/react'),
  'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
  'react-router-dom': path.resolve(__dirname, '../node_modules/react-router-dom'),
  'styled-components': path.resolve(__dirname, '../node_modules/styled-components'),
};

const output = path.resolve(__dirname, '../dist/client');

const extensions = ['.ts', '.tsx', '.js'];

module.exports = {
  extensions,
  loaders,
  plugins,
  aliases,
  output,
  shouldUseSourceMap,
};
