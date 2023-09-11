/* global describe, it, beforeEach, afterEach */
import assert from 'assert';
import sinon from 'sinon';
import request from 'supertest';
import R from 'ramda';

import app from '../../src';

const req = ({ url = '/', query = {}, headers = {} }) =>
  request(app)
    .get(url)
    .set(headers)
    .query(query);

describe('functions', () => {
  describe('retry', () => {
    const { retry } = require('../../src/utils/functions');

    let clock;

    /* eslint no-return-assign: 0 */
    beforeEach(() => (clock = sinon.useFakeTimers()));
    afterEach(() => clock.restore());

    it('should be called on a certain amount of time', () => {
      const stub = sinon.stub().returns(Promise.resolve());
      retry(stub, 100);
      sinon.assert.notCalled(stub);
      clock.tick(101);
      sinon.assert.calledOnce(stub);
    });

    it('should propagate the result', () => {
      const success = sinon.stub().returns(Promise.resolve(1));
      const successfulResult = retry(success, 1000);
      clock.tick(1001);
      successfulResult.then(v => assert.equal(v, 1));
    });

    it('should propagate the error', () => {
      const fail = sinon.stub().returns(Promise.reject(0));
      const failureResult = retry(fail, 10000);
      clock.tick(10001);
      failureResult.catch(v => assert.equal(v, 0));
    });
  });
});
