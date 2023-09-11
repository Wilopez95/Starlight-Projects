import assert from 'assert';
import { body, expect } from '../../helpers/request';
import mockDriver from '../../fixtures/driver';
import { clear } from '../../helpers/data';

let createdDriver;
const unexistedDriver = mockDriver();

export const before = async api => {
  createdDriver = await body(api.createDriver().send(mockDriver()));
};

export const after = clear;

export default {
  'find by username': async request => {
    const foundDriver = await body(
      expect(
        200,
        request({
          username: createdDriver.username,
        }),
      ),
    );
    assert.deepEqual(createdDriver, foundDriver);
  },

  'not found': async request => {
    await expect(404, request({ username: unexistedDriver.username }));
  },

  invalid: async request => {
    await expect(400, request({ username: '' }));
  },
};
