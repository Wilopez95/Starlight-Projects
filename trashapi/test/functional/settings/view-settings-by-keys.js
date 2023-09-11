import assert from 'assert';
import { body, expect } from '../../helpers/request';
import { clear } from '../../helpers/data';

const mock = [
  {
    key: 'map',
    value: {
      lon: 180,
      lat: 180,
    },
  },
  {
    key: 'map1',
    value: {
      lon: 180,
      lat: 180,
    },
  },
];
export const before = async api => {
  await api.bulkUpdateSettings().send(mock);
};

export const after = clear;

export default {
  [`API-201 view settings by keys`]: async request => {
    const [mapConfig] = await body(
      expect(200, request().query({ keys: 'map,test,test,test,www' })),
    );
    assert.equal(mock[0].key, mapConfig.key);
    assert.deepEqual(mock[0].value, mapConfig.value);

    const result = await body(
      expect(200, request().query({ keys: `${mock[0].key},${mock[1].key}` })),
    );
    assert.equal(result.length, 2);
  },
  [`API-201 request with incorrect key`]: async request => {
    const result = await body(
      expect(200, request().query({ keys: 'KeyNotExist' })),
    );
    assert.equal(result.length, 0);
  },
  [`API-201 should return all settings`]: async request => {
    const settings = await body(expect(200, request()));
    assert.equal(settings.length, mock.length);
  },
};
