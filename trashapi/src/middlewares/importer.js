import R from 'ramda';
import { Router as router } from 'express';
import _debug from 'debug';
import csv from 'csv';
import { my } from '../utils/query.js';
import { promisify } from '../utils/functions.js';
import { invalidInput } from '../utils/errors.js';
import asyncWrap from '../utils/asyncWrap.js';
import constants from '../utils/constants.js';
import { bodyType } from './validation.js';

const { parse } = csv;
const {
  import: {
    type: { APPEND },
  },
} = constants;

const debug = _debug('api:middleware:import');

export default ({ validate, importers, mapCSV }) =>
  router().post(
    '/',
    bodyType('Object'),
    asyncWrap(async ({ query: { type }, body: { csv: csvText }, user }, res, next) => {
      // eslint-disable-next-line
      type = type || APPEND;
      debug('type', type);
      if (!R.is(String, csvText)) {
        return next(invalidInput('Parameter csv should be a string in CSV format'));
      }
      let csv;
      try {
        csv = validate(await promisify(cb => parse(csvText, cb)));
      } catch (error) {
        return next(invalidInput(error.message));
      }
      const importer = importers[R.toLower(type)];
      if (!importer) {
        return next(invalidInput('Unsupported type of import'));
      }
      await my(
        query =>
          R.reduce(
            (acc, seed) => acc.then(() => importer(user, query, seed)).catch(err => debug(err)),
            Promise.resolve(),
            mapCSV(csv),
          ),
        user,
      );
      return res.status(204).send(null);
    }),
  );
