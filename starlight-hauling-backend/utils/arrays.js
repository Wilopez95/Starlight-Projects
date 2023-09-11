import compose from 'lodash/fp/compose.js';
import zip from 'lodash/fp/zip.js';
import flatten from 'lodash/fp/flatten.js';

export const mergeArrays = compose(flatten, zip);

// This is useful for long lists of knex.raw substitutions
export const stringOf = (length, fill, separator = ' ') =>
  Array.from({ length }).fill(fill).join(separator);

export const enumToCheckConstraint = arr => arr.map(value => `'${value}'`).join(', ');

export const randomArrayItem = list => list[Math.floor(Math.random() * list.length)];
