/* global describe, it, before, beforeEach, after, afterEach */
import { existsSync } from 'fs';
import { join } from 'path';
import R, { compose as o } from 'ramda';

import { paths } from '../helpers/runner';
import geocodingServer from '../helpers/geocoding-server';
import api from '../../apidocs/index.js';

const argv = param =>
  R.pipe(R.splitWhen(R.equals(param)), R.path([1, 1]))(process.argv);

const routeArg = argv('--route');

const fail = (name, message) => it(name, () => Promise.reject(message));

const test = (route, ...args) => ([name, runner]) => {
  let _it = it;
  if (/\.only\(\)/.test(name)) {
    _it = it.only;
  }

  if (/\.pass\(\)/.test(name)) {
    _it = it.pass;
  }
  _it(name, () => runner(...args));
};

const isTests = R.both(R.isEmpty, R.all(o(R.is(Function), R.last)));

describe('Routes', () =>
  R.forEach(([action, testCase, tag, request, api]) => {
    const testCasePath = join(__dirname, tag, testCase + '.js');
    if (!existsSync(testCasePath)) {
      return fail(action, `Test case with name "${testCase}" not found`);
    }
    const routeName = R.head(R.split(/\s-\s/, action));
    const route = require(testCasePath);
    const runners = R.toPairs(route.default);
    if (isTests(runners)) {
      return fail(
        action,
        `Test case with name "${testCase}" should export an object with
      functions to run`,
      );
    }
    const suite = function() {
      this.timeout(0);
      const bindApi = R.partial(R.__, [api]);
      //  (R.is(Function, route.authServer) ? route.authServer : defAuthServer)();
      (R.is(Function, route.geoServer) ? route.geoServer : geocodingServer)();
      if (R.is(Function, route.before)) {
        before(bindApi(route.before));
      }
      if (R.is(Function, route.beforeEach)) {
        beforeEach(bindApi(route.beforeEach));
      }
      R.forEach(test(route, request, api), runners);

      if (R.is(Function, route.after)) {
        after(bindApi(route.after));
      }
      if (R.is(Function, route.afterEach)) {
        afterEach(bindApi(route.afterEach));
      }
    };
    if (!routeArg || R.contains(routeName, R.split(/\s+/, routeArg))) {
      describe(action, suite);
    } else {
      describe.skip(action, suite);
    }
  }, paths(api)));
