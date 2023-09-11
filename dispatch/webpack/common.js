/* eslint-disable */
const path = require('path');
const pkg = require('../package.json');

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const StyledComponentsPlugin = require('typescript-plugin-styled-components').default;
const Dotenv = require('dotenv-webpack');

const loaders = {
  javascript: {
    development: {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: ['babel-loader'],
    },
    production: {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
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
          plugins: [
            // "@babel/plugin-proposal-class-properties",
            // "@babel/plugin-proposal-nullish-coalescing-operator",
          ],
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
        { loader: 'css-loader' },
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
            // Prefer `dart-sass`
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
        {
          loader: 'css-loader',
          options: {
            importLoaders: 3,
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
            // Prefer `dart-sass`
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
    test: /\.svg$/,
    issuer: /\.tsx|\.js$/,
    use: [
      {
        loader: '@svgr/webpack',
        options: {
          expandProps: 'end',
          svgo: true,
        },
      },
    ],
  },
  assets: {
    test: /\.svg$|\.png$|\.md$|\.jpe?g$/,
    oneOf: [
      {
        test: /\.svg$/,
        issuer: /\.s?css$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              fallback: 'file-loader',
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.png$|\.md$|\.jpe?g$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              fallback: 'file-loader',
              limit: 8192,
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
    minify: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: false,
      useShortDoctype: true,
    },
  }),

  css: new MiniCssExtractPlugin({
    filename: '[name].[contenthash:5].css',
    chunkFilename: '[id].[contenthash:5].css',
  }),
  terser: new TerserWebpackPlugin({
    parallel: 4,
    extractComments: false,
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
  scssTypings: new webpack.WatchIgnorePlugin({ paths: [/\.scss\.d\.ts$/] }),
  env: new Dotenv({
    path: `webpack/env/.env.${process.env.NODE_ENV}`,
  }),
  environmentVariables: new webpack.EnvironmentPlugin({
    npm_package_version: pkg.version,
  }),
  progress: new webpack.ProgressPlugin(),
  provide: new webpack.ProvidePlugin({
    process: 'process/browser',
  }),
};

const aliases = {
  '@root': path.resolve(__dirname, '../src'),
  '@hooks': path.resolve(__dirname, '../src/hooks'),
  '@assets': path.resolve(__dirname, '../assets'),
  components: path.resolve(__dirname, '../src/components'),
  utils: path.resolve(__dirname, '../src/utils'),
  static: path.resolve(__dirname, '../src/static'),
  state: path.resolve(__dirname, '../src/state'),
  scenes: path.resolve(__dirname, '../src/scenes'),
  helpers: path.resolve(__dirname, '../src/helpers'),
  forms: path.resolve(__dirname, '../src/forms'),
};

const output = path.resolve(__dirname, '../dist/client');

const extensions = ['.ts', '.tsx', '.js'];

module.exports = {
  extensions,
  loaders,
  plugins,
  aliases,
  output,
};
