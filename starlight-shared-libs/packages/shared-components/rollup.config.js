import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';
import svgr from '@svgr/rollup';
import alias from '@rollup/plugin-alias';

import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

import url from 'postcss-url';

const extensions = ['.ts', '.tsx', '.json', '.svg'];

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  'react-day-picker/lib/src/classNames',
  'react-day-picker/lib/style.css',
  'flatpickr/dist/themes/material_green.css',
  'flatpickr/dist/flatpickr.css',
];

const sharedPlugins = [
  alias({
    entries: {
      'react-select': 'node_modules/react-select/dist/react-select.cjs.js',
      'react-select/async': 'node_modules/react-select/async/dist/react-select.cjs.js',
    },
    customResolver: resolve({ extensions }),
  }),
  svgr(),
  commonjs(),
  typescript({
    typescript: require('ttypescript'),
    useTsconfigDeclarationDir: true,
    tsconfig: 'tsconfig.rollup.json',
    tsconfigDefaults: {
      compilerOptions: {
        plugins: [
          { transform: 'typescript-transform-paths' },
          { transform: 'typescript-transform-paths', afterDeclarations: true },
        ],
      },
    },
  }),
  image(),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'cjs',
      },
    ],
    external,
    plugins: [
      ...sharedPlugins,
      postcss({
        modules: true,
        use: ['sass'],
        plugins: [
          url({
            url: 'inline', // enable inline assets using base64 encoding
            maxSize: 50, // maximum file size to inline (in kilobytes)
            fallback: 'copy', // fallback method to use if max size is exceeded
          }),
        ],
      }),
    ],
  },
];
