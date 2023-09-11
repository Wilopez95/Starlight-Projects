/* eslint new-cap: 0 */
/* eslint camelcase: ["error", {properties: "never"}] */
import R, { compose as o, flip as f } from 'ramda';
import S, { C } from 'sanctuary';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import config from '../../src/config';

import app from '../../src';
import { camelize, kebabize } from '../../src/utils/functions';

export const generateToken = ({
  time = '12h',
  secret = config.get('session.secret'),
} = {}) => {
  return jwt.sign(
    {
      issuer: 'starlightpro',
      email: 'steven.truesdell@starlightpro.com',
      username: 'strues',
      subject: '02ccfb64-c324-11e7-8a4c-d34a7150124f',
    },
    secret,
    { expiresIn: time },
  );
};

const authData = { token: generateToken() };

// propPairs :: k -> {k: {a: b}} -> [[a, b]]
// propPairs('a', {a: {k: 'v'}})
// > [['k', 'v']]
const propPairs = R.uncurryN(2, x =>
  R.pipe(S.get(Object, x), R.map(R.toPairs), S.fromMaybe([])),
);

// template :: String -> Object -> a
// template('some{ParamId}StringVar', {ParamId: 1})
// > 1
const template = R.curry((path, params) =>
  R.replace(
    /{.*?}/g,
    R.pipe(
      // retrieve property name from string {propertyName}
      R.replace(/[\{\}]/g, ''),
      // get value by this propertyName from params object
      C(R.prop, params),
    ),
    path,
  ),
);

// mapPairs :: (a -> b) -> Object -> [b]
// mapPairs(R.join('='), {a: 1, b: 2})
// > ['a=1', 'b=2']
const mapPairs = R.uncurryN(2, f => o(R.map(f), R.toPairs));

// req :: String -> String -> Object -> Promise
const req = (path, method) => vars =>
  request(app)
    [method](template(path)(vars))
    .query(authData);

// flatMapPaths :: [a] -> (a -> String -> Object -> d) -> [d]
const flatMapPaths = (paths, fn) =>
  f(R.chain)(paths, ([path, methods]) =>
    mapPairs(([method, opts]) => fn(path, method, opts), methods),
  );

// api :: [a] -> API
const api = paths =>
  R.fromPairs(
    flatMapPaths(paths, (path, method, opts) => [
      camelize(opts['x-name']),
      req(path, method),
    ]),
  );

// tag :: Object -> String
// tag({tags: ['Work Orders']})
// > 'work-orders'
// tag({})
// > 'default'
const tag = R.pipe(
  // take prop 'tags'
  R.prop('tags'),
  // if not array, then wrap it with array
  R.unless(R.is(Array), R.of),
  // take first item from array
  R.head,
  // if nil, then return 'default'
  R.defaultTo('default'),
  // transpile it to kebab form
  kebabize,
);

// unfoldSwagger :: [a] -> [[String, String, String, (Object -> Promise), API]]
const unfoldSwagger = paths =>
  flatMapPaths(paths, (path, method, opts) => [
    `${opts['x-name']} - ${method} ${path}`,
    opts['x-name'],
    tag(opts),
    req(path, method),
    api(paths),
  ]);

export const paths = o(unfoldSwagger, propPairs('paths'));
export const definitions = propPairs('definitions');

export const wait2Seconds = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 2000);
  });
};
