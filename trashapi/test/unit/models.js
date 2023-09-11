/* global describe, it, beforeEach */
import assert from 'assert';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import R from 'ramda';

proxyquire.noCallThru();

describe('models', () => {
  describe('Locations', () => {
    describe('setLocationId', () => {
      it('should be callable without options object', async () => {
        const { setLocationId } = require('../../src/models/locations');
        assert.equal(
          await setLocationId(undefined, undefined, undefined),
          R.identity,
        );
      });
    });
  });

  describe('geocoding', () => {
    let json;
    let fetch;
    let retrySpy;
    let retry;

    beforeEach(() => {
      json = sinon.stub().returns(
        Promise.resolve({
          status: 'OVER_QUERY_LIMIT',
          results: [],
        }),
      );
      fetch = sinon.stub().returns(Promise.resolve({ json }));
      retrySpy = sinon.spy();
      retry = (f, ms) => {
        retrySpy(ms);
        return f();
      };
    });

    it('should try four times without any success', async () => {
      const { default: geocoding } = proxyquire('../../src/models/geocoding', {
        'node-fetch': fetch,
        '../utils/functions': { retry, urlFormat: R.identity },
      });
      try {
        await geocoding({ name: 'Linkoln Street' });
        assert.fail();
      } catch (e) {
        assert.notEqual(e.name, 'AssertionError');
        assert(e instanceof Error);
      }
      sinon.assert.callCount(fetch, 4);
      sinon.assert.callCount(retrySpy, 4);
      sinon.assert.callCount(json, 4);
      sinon.assert.calledWith(retrySpy, 250);
      sinon.assert.calledWith(retrySpy, 500);
      sinon.assert.calledWith(retrySpy, 750);
      sinon.assert.calledWith(retrySpy, 1000);
    });

    it('should try 3 times and start from 3', async () => {
      const { default: geocoding } = proxyquire('../../src/models/geocoding', {
        'node-fetch': fetch,
        '../utils/functions': { retry, urlFormat: R.identity },
      });
      try {
        await geocoding({ name: 'Linkoln Street' }, 5, 3);
        assert.fail();
      } catch (e) {
        assert.notEqual(e.name, 'AssertionError');
        assert(e instanceof Error);
      }
      sinon.assert.callCount(fetch, 3);
      sinon.assert.callCount(retrySpy, 3);
      sinon.assert.callCount(json, 3);
      sinon.assert.calledWith(retrySpy, 750);
      sinon.assert.calledWith(retrySpy, 1000);
      sinon.assert.calledWith(retrySpy, 1250);
    });
  });
});
