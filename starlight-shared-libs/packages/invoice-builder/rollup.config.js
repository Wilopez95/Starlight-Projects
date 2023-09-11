import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';

import postcss from 'rollup-plugin-postcss';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

const extensions = ['.ts', '.tsx', '.json'];

const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
];

const sharedPlugins = [
  resolve({ extensions }),
  commonjs(),
  typescript({ useTsconfigDeclarationDir: true }),
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
        extract: 'styles.css',
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
      },
    ],
    external,
    plugins: [
      ...sharedPlugins,
      postcss({
        modules: true,
        use: ['sass'],
        inject: true,
      }),
      terser(),
    ],
  },
];
