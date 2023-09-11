/* eslint-disable no-promise-executor-return */
import url from 'url';
import csv from 'csv';
import R from 'ramda';
import mapKeys from 'lodash/fp/mapKeys.js';
import camelCase from 'lodash/fp/camelCase.js';
import { conflict } from './errors.js';

// foldP :: (a -> b -> Promise a) -> a -> [b] -> Promise a
// foldP(
//   (acc, url) => fetch(url).then(({status}) => R.append(status, acc)),
//   [],
//   ['/']
// )
// > Promise.resolve([200])

export const foldP = R.uncurryN(
  3,
  f => acc =>
    R.reduce((promise, ...item) => promise.then(accm => f(accm, ...item)), Promise.resolve(acc)),
);

// normalizeTableName :: String -> String
// normalizeTableName('locations1')
// > location
const normalizeTableName = R.compose(R.replace(/\d$/, ''), R.replace(/s(?=[^s]*$)/, ''));

// safeDigitExtraction :: String -> String
// safeDigitExtraction('locations1')
// > '1'
// safeDigitExtraction(undefined)
// > ''
const safeDigitExtraction = R.compose(R.propOr('', 0), R.match(/\d$/), R.defaultTo(''));

// fields :: [a] -> Table -> [Query a]
// fields(['name'], cans)
// > [cans.name.as('canName')]
export const fields =
  names =>
  (table, prefix = normalizeTableName(table.alias || table._name)) =>
    R.map(
      name =>
        table[name].as(
          `${prefix}${R.concat(R.toUpper(R.head(name)), R.tail(name))}${safeDigitExtraction(
            table.alias,
          )}`,
        ),
      names,
    );

export const pickQuick = (fieldsParam, values) => {
  const result = {};
  fieldsParam.forEach(val => {
    result[val] = values[val];
  });
  return result;
};

// columns :: [a] -> [b] -> Table -> [b]
// columns(['id'], ['name'], sql.define({columns: ['id', 'surname']}))
// > ['name', 'surname']
export const columns = R.uncurryN(
  3,
  except => and =>
    R.pipe(R.prop('columns'), R.groupBy(R.prop('property')), R.omit(except), R.keys, R.concat(and)),
);

// toUnderscore :: String -> String
// toUnderscore('camelCaseString')
// > camel_case_string
// toUnderscore('not_camel_case_string')
// > not_camel_case_string
export const toUnderscore = R.pipe(R.replace(/([A-Z])/g, '_$1'), R.replace(/_([A-Z])/g, R.toLower));

// -- Transpile kebab-styled-string or underscored_string into camelStyledOne
// camelize :: String -> String
// camelize('string_splitted_using_underscores')
// > 'stringSplittedUsingUnderscores'
// camelize('kebab-styled-string')
// > 'kebabStyledString'
export const camelize = R.replace(/[_-]([a-z])/g, R.compose(R.replace(/[_-]/g, ''), R.toUpper));

// -- Transpile CamelStyledString into kebab-styled-one
// kebabize :: String -> String
// kebabize('CamelStyledString')
// > 'camel-styled-string'
// -- also will skip whitespaces
// kebabize('Not A Camel String Actually')
// > 'not-a-camel-string-actually'
export const kebabize = R.replace(/(\s?[A-Z])/g, R.compose(R.replace(/\s/, '-'), R.toLower));

// camelizeObject :: Object -> Object
// camelizeObject({
//   a_b: 1,
//   c_d: 2
// })
// > {
//   aB: 1,
//   cD: 2
// }
export const camelizeObject = R.pipe(
  // convert object to list of pairs [[key, value], [key, value]]
  R.toPairs,
  // iteratively apply camelize function to each key in the list
  R.map(R.over(R.lensIndex(0), camelize)),
  // reassamble an object from the list of pairs
  R.fromPairs,
);

// paramsList :: Object -> [String]
// paramsList({a: 1, b: 2})
// > ['a=1', 'b=2']
const paramsList = R.compose(R.map(R.join('=')), R.toPairs);

// splitQueryString :: String -> [String]
// splitQueryString('?a=1&b=2')
// > ['a=1', 'b=2']
const splitQueryString = R.compose(R.split(/&/), R.replace(/^\?/, ''), R.defaultTo(''));

// buildQueryString :: [String] -> String
// buildQueryString(['a=1', 'b=2'])
// > '?a=1&b=2'
const buildQueryString = R.compose(
  R.replace(/\s/g, '+'),
  R.concat('?'),
  R.join('&'),
  R.filter(R.identity),
);

// insertParams :: Object -> String -> String
// insertParams({a: 1}, '?b=2')
// > '?a=1&b=2'
const insertParams = R.uncurryN(2, params =>
  R.pipe(splitQueryString, R.concat(paramsList(params)), buildQueryString),
);

// urlFormat :: Object -> URL -> URL
// urlFormat({a: 1}, 'http://example.com')
// > 'http://example.com?a=1'
export const urlFormat = R.uncurryN(2, params =>
  R.pipe(
    R.construct(url.URL),
    R.over(R.lensProp('search'), insertParams(params)),
    R.omit(['path', 'href', 'query']),
    url.format,
  ),
);

// retry :: (() -> Promise) -> Number -> Promise
/**
 * "retry is a function that takes a function and a time, and returns a promise that will resolve or
 * reject after the given time."
 *
 * The function retry is a higher order function. It takes a function as an argument and returns a
 * function
 * @param f {Function} - The function to retry.
 * @param time {number} - The time in milliseconds to wait before retrying the function.
 */
export const retry = (f, time) =>
  new Promise((resolve, reject) => setTimeout(() => f().then(resolve).catch(reject), time));

// promisify :: ((a -> b -> c) -> c) -> Promise(c, a)
export const promisify = f =>
  new Promise((resolve, reject) =>
    f((err, result) => {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    }),
  );

// transformCSV :: ([a] -> Promise([a])) -> String -> Promise(String)
export const transformCSV = async (f, stringifiedCSV) => {
  const parsedCSV = await promisify(cb => csv.parse(stringifiedCSV, cb));
  await promisify(async cb => csv.stringify(await f(parsedCSV), cb));
};

/**
 * It checks if an object with the same params exists in the database, and if it does, it returns it
 * @param object - the object that is being created
 * @param query - the query object that was passed to the resolver
 * @param user - the user who is making the request
 * @returns the recreated instance if the instance is deleted.
 */
export const onCreateValidation = async (
  object,
  query,
  user,
  { findAll, update, clean = R.identity },
) => {
  if (!R.any(R.isNil, R.values(R.omit(['description'], object)))) {
    const { description } = object;
    const objectList = await findAll({ ...R.omit(['description'], object), deleted: '1' }, query);

    if (!R.isEmpty(objectList)) {
      const instance = objectList[0];
      const hasDescription = description && R.has('description', instance);

      if (instance.deleted) {
        const preparedInstance = {
          ...clean(instance),
          deleted: '0',
        };
        if (hasDescription) {
          preparedInstance.description = description;
        }

        const recreatedInstance = await update(instance.id, preparedInstance, user, query);

        return recreatedInstance;
      }
      if (hasDescription && description !== instance.description) {
        throw conflict(`Descriptions conflict. Instance with such params exists`);
      } else {
        return instance;
      }
    }
  }
};

/**
 * It returns true if the value is an integer, and false otherwise
 * @param value {number | string } - the value to be checked
 * @returns A function that takes in a value and returns a boolean.
 */
export const validateInteger = value => {
  if (!value && value !== 0) {
    return false;
  }
  const num = parseInt(value, 10);
  return Number.isInteger(num) && num.toString() === value.toString();
};

export const validateBoolean = value => ['true', 'false'].includes(value);

export const validateString = value => value?.length && typeof value === 'string';

export const validateQueryParam = (value, config) => {
  if (value === undefined || value === '') {
    return false;
  }
  const { key, type } = config;
  switch (type) {
    case 'integer':
      return validateInteger(value);
    case 'boolean':
      return validateBoolean(value);
    case 'string':
      return validateString(value);
    default:
      throw new Error(`
        Unresolved type "${type}" of check  for query param "${key}"
      `);
  }
};

export const camelCaseKeys = mapKeys(camelCase);
