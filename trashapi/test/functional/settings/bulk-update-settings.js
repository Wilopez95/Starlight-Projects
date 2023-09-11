import assert from 'assert';
import { body, expect } from '../../helpers/request';
import { clear } from '../../helpers/data';

const mockConfig = [
  {
    key: 'map',
    value: {
      lon: 180,
      lat: 180,
    },
  },
];

const mock2 = [
  {
    key: 'map',
    value: {
      WWW: '111',
    },
  },
  {
    key: 'testKey1',
    value: {
      TTT: '222',
    },
  },
  {
    key: 'testKey2',
    value: {
      ZZZ: '333',
    },
  },
];
const newValue = [
  {
    key: 'map',
    value: { test: 'www' },
  },
];
export const beforeEach = async api => {
  await api.bulkUpdateSettings().send(mockConfig);
};

export const afterEach = clear;

export default {
  [`API-201 update settings entry`]: async request => {
    const [result] = await body(expect(202, request().send(newValue)));
    assert.deepEqual(result.value, newValue[0].value);
  },
  [`API-201 bulk update settings entry`]: async (request, api) => {
    const result = await body(expect(202, request().send(mock2)));
    assert.equal(result.length, mock2.length);
    const [updetedEntry] = await body(
      expect(
        200,
        api.viewSettingsByKeys().query({ keys: `${mockConfig[0].key}` }),
      ),
    );
    assert.equal(updetedEntry.key, mock2[0].key);
    assert.deepEqual(updetedEntry.value, mock2[0].value);
  },
  [`API-201 query without key or value`]: async request => {
    const testData = [
      {
        value: { test: 'www' },
      },
    ];
    const testData1 = [
      {
        key: 'test',
      },
    ];
    await body(expect(500, request().send(testData)));
    await body(expect(500, request().send(testData1)));
  },
  [`API-201 bulk update should fail if some entry is missing key`]: async (
    request,
    api,
  ) => {
    const testData = {
      value: { test: 'www' },
    };
    await body(expect(500, request().send([...mock2, testData])));
    const settingsArray = await body(
      expect(
        200,
        api.viewSettingsByKeys().query({ keys: 'testKey1,testKey2' }),
      ),
    );
    assert.equal(settingsArray.length, 0);
  },
  [`API-201 bulk update should fail if some val isn't a correct JSON`]: async (
    request,
    api,
  ) => {
    const testData = {
      key: 'test',
      value: undefined,
    };
    await body(expect(500, request().send([...mock2, testData])));
    const settingsArray = await body(
      expect(
        200,
        api.viewSettingsByKeys().query({ keys: 'testKey1,testKey2' }),
      ),
    );
    assert.equal(settingsArray.length, 0);
  },
  [`API-201 bulk update\create should fail if key is empty string`]: async (
    request,
    api,
  ) => {
    const testData = {
      key: '',
      value: { test: 'www' },
    };
    await body(expect(400, request().send([...mock2, testData])));
    const settingsArray = await body(
      expect(
        200,
        api.viewSettingsByKeys().query({ keys: 'testKey1,testKey2' }),
      ),
    );
    assert.equal(settingsArray.length, 0);
  },
};
