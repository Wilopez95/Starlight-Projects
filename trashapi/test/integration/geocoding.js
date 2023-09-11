/* global describe, it */
import assert from 'assert';
import R from 'ramda';
import request from 'supertest';

import app from '../../src';
import { foldP } from '../../src/utils/functions';
import authData from '../fixtures/auth-data';
import { body, expect } from '../helpers/request';

const addresses = R.times(R.always('1150 Lafayette St, CO, Denver'), 100);

describe('geocoding', function() {
  this.timeout(0);
  it('should return locations for all addresses no matter what', async () => {
    const locations = await foldP(
      async (acc, address) =>
        R.concat(
          acc,
          await body(
            expect(
              200,
              request(app)
                .get('/v1/locations')
                .query({
                  ...authData,
                  name: address,
                }),
            ),
          ),
        ),
      [],
      addresses,
    );
    assert.equal(addresses.length, locations.length);
  });
});
