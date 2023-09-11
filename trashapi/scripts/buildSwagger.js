#! /usr/bin/env node
import { resolve, dirname } from 'path';

import R from 'ramda';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import { foldP } from '../src/utils/functions.js';

const path = R.partial(resolve, [process.cwd()]);

const run = (traverse, contentBuffer, filePath) =>
  traverse(
    yaml.safeLoad(contentBuffer.toString()),
    R.partial(resolve, [dirname(filePath)]),
  );

const traverse = async (swagger, swaggerPath) => {
  return foldP(
    async (acc, [key, value]) => {
      if (key === '$fs-ref') {
        return foldP(
          async (acc, value) => {
            const dependencyPath = swaggerPath(value);
            const content = await fs.readFile(dependencyPath, 'utf8');
            const traversedValue = await run(traverse, content, dependencyPath);
            if (R.is(Array, traversedValue) && R.isEmpty(acc)) {
              return traversedValue;
            }
            return R.merge(acc, traversedValue);
          },
          acc,
          R.unless(R.isArrayLike, R.of, value),
        );
      }
      value = R.is(Object, value) ? await traverse(value, swaggerPath) : value;
      key = R.test(/^\d+$/, key) ? Number(key) : key;
      const set = R.type(acc) === 'Array' ? R.update : R.assoc;
      const result = set(key, value, acc);
      return R.is(Array, result) && R.is(Array, acc) && acc.length - 1 === key
        ? R.flatten(result)
        : result;
    },
    R.type(swagger) === 'Array' ? R.times(R.identity, swagger.length) : {},
    R.toPairs(swagger),
  );
};

(async () => {
  const [, , layout, build] = process.argv;
  const layoutPath = path(layout);
  const content = await fs.readFile(path(layout), 'utf-8');
  await fs.writeFile(
    path(build),
    yaml.safeDump(await run(traverse, content, layoutPath)),
    'utf-8',
  );
})().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
