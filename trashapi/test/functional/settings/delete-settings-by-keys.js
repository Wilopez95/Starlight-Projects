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
    key: 'testKey1',
    value: {
      lon: 180,
      lat: 180,
    },
  },
  {
    key: 'testKey2',
    value: {
      lon: 180,
      lat: 180,
    },
  },
];
export const beforeEach = async api => {
  await api.bulkUpdateSettings().send(mock);
};

export const afterEach = clear;

export default {
  [`API-201 delete settings by keys`]: async (request, api) => {
    const [newSetting] = await body(
      expect(200, api.viewSettingsByKeys().query({ keys: 'map' })),
    );
    assert.equal(newSetting.key, mock[0].key);
    const result = await request().query({ keys: 'map' });
    assert.equal(result.status, 204);
  },
  [`API-201 delete request with empty query`]: async (request, api) => {
    const result = await request();
    assert.equal(result.status, 204);
    const emptyResult = await body(expect(200, api.viewSettingsByKeys()));
    assert.equal(emptyResult.length, 0);
  },
  [`API-201 delete request with incorrect key`]: async request => {
    const result = await request().query({ keys: 'WWWWW' });
    assert.equal(result.status, 204);
  },
  [`API-201 bulk delete`]: async (request, api) => {
    const settingsArray = await body(
      expect(
        200,
        api.viewSettingsByKeys().query({ keys: 'testKey1,testKey2' }),
      ),
    );
    assert.equal(settingsArray.length, 2);
    const result = await request().query({ keys: 'testKey1,testKey2' });
    assert.equal(result.status, 204);
    const emptyResult = await body(
      expect(
        200,
        api.viewSettingsByKeys().query({ keys: 'testKey1,testKey2' }),
      ),
    );
    assert.equal(emptyResult.length, 0);
    const setting = await body(
      expect(200, api.viewSettingsByKeys().query({ keys: 'map' })),
    );
    assert.equal(setting.length, 1);
  },
};
