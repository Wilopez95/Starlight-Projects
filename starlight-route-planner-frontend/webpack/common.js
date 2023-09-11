const path = require('path');
const webpack = require('webpack');
const ExtractCssChunksPlugin = require('extract-css-chunks-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const styledComponentsPlugin = require('typescript-plugin-styled-components').default;
const dotenv = require('dotenv');

// TODO: convert webpack config to TS or add ESLint override

const env = dotenv.config({
  // eslint-disable-next-line
  path: `webpack/env/.env.${process.env.NODE_ENV}`,
}).parsed;

const loaders = {
  typescript: {
    development: {
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /[\\/]node_modules[\\/]/,
      options: {
        transpileOnly: true,
        getCustomTransformers: () => ({
          before: [
            styledComponentsPlugin({
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
            styledComponentsPlugin({
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
      test: /\.scss$/,
      use: [
        'style-loader',
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
      test: /\.scss$/,
      use: [
        {
          loader: ExtractCssChunksPlugin.loader,
          options: {
            esModule: true,
          },
        },
        {
          loader: 'css-loader',
          options: {
            importLoaders: 3,
            modules: {
              localIdentName: '[local]-[contenthash:5]',
            },
          },
        },
        'postcss-loader',
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
    include: /[\\/]node_modules[\\/]/,
    use: [
      {
        loader: ExtractCssChunksPlugin.loader,
        options: {
          esModule: true,
        },
      },
      'css-loader',
    ],
  },
  svg: {
    test: /\.svg$/,
    issuer: {
      test: /\.tsx?$/,
    },
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
    test: /\.svg$|\.png$|\.jpe?g$/,
    oneOf: [
      {
        test: /\.svg$/,
        issuer: { test: /\.s?css$/ },
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
        test: /\.png$|\.jpe?g$/,
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
    exagoUrl: process.env.EXAGO_BACKEND_URL,
  }),
  clean: new CleanWebpackPlugin(),
  css: new ExtractCssChunksPlugin({
    filename: '[name].[contenthash:5].css',
    chunkFilename: '[id].[contenthash:5].css',
  }),
  terser: new TerserWebpackPlugin({
    cache: true,
    parallel: true,
    terserOptions: {
      output: {
        comments: false,
      },
    },
    extractComments: false,
  }),
  optimizeCss: new OptimizeCSSAssetsPlugin(),
  scssTypings: new webpack.WatchIgnorePlugin([/\.scss\.d\.ts$/]),
  environmentVariables: new webpack.EnvironmentPlugin(Object.keys(env)),
  progress: new webpack.ProgressPlugin(),
};

const aliases = {
  '@root': path.resolve(__dirname, '../src'),
  '@hooks': path.resolve(__dirname, '../src/hooks'),
  '@assets': path.resolve(__dirname, '../assets'),
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
