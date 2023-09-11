/* global describe, it */
import assert from 'assert';
import proxyquire from 'proxyquire';

const durationSeconds = '1 hour 58 mins.';
const l = { lon: 1, lat: 2 };
const strL = `${l.lat},${l.lon}`;

const leg = {
  duration: {
    text: durationSeconds,
  },
};

const googleResponse = {
  routes: [
    {
      legs: [leg],
    },
  ],
};

const makeFakeGoogleDir = (error, data, isArgs) => {
  const toJson = d => ({ json: () => d });
  const nodeFetch = url =>
    error
      ? Promise.reject(error)
      : Promise.resolve(toJson(isArgs ? url : data));

  const { getTravelTime, buildUrl, default: fetchDirections } = proxyquire(
    '../../src/utils/google-map-directions',
    {
      'node-fetch': nodeFetch,
    },
  );
  return { getTravelTime, fetchDirections, buildUrl };
};

describe('test google map directions ', () => {
  it('fetchDirections success', async () => {
    const location = { lon: 1, lat: 2 };
    const { fetchDirections } = makeFakeGoogleDir(null, googleResponse);
    const resp = await fetchDirections(location, location);
    assert.equal(resp.routes[0].legs[0].duration.text, durationSeconds);
  });

  it('google fetchDirections with lot and lat', async () => {
    const { fetchDirections, buildUrl } = makeFakeGoogleDir(
      null,
      googleResponse,
      true,
    );
    const resp = await fetchDirections(l, l);
    assert.equal(resp, buildUrl(strL, strL));
  });

  it('google fetchDirections error', async () => {
    const error = 'error';
    const { fetchDirections } = makeFakeGoogleDir(error);
    try {
      await fetchDirections(l, l);
    } catch (err) {
      assert.deepEqual(err, error);
    }
  });

  it('getTravelTime success', async () => {
    const { getTravelTime } = makeFakeGoogleDir(null, googleResponse);
    const resp = await getTravelTime(l, l);
    assert.equal(resp, durationSeconds);
  });

  it('google getTravelTime should return null if one of locations null', async () => {
    const { getTravelTime } = makeFakeGoogleDir(null, googleResponse);
    const resp = await getTravelTime({ ...l, lat: null }, l);
    assert.equal(resp, null);
  });

  it('google getTravelTime should return null on empty routes', async () => {
    const x = {
      ...googleResponse,
      routes: [],
    };
    const { getTravelTime } = makeFakeGoogleDir(null, x);
    const resp = await getTravelTime(l, l);
    assert.equal(resp, null);
  });

  it('google getTravelTime should return null on empty legs', async () => {
    const x = {
      ...googleResponse,
      routes: [
        {
          legs: [],
        },
      ],
    };
    const { getTravelTime } = makeFakeGoogleDir(null, x);
    const resp = await getTravelTime(l, l);
    assert.equal(resp, null);
  });

  it('google getTravelTime should return null on empty duration value', async () => {
    const x = {
      ...googleResponse,
      routes: [
        {
          legs: [
            {
              duration: { value: null },
            },
          ],
        },
      ],
    };
    const { getTravelTime } = makeFakeGoogleDir(null, x);
    const resp = await getTravelTime(l, l);
    assert.equal(resp, null);
  });

  it('google getTravelTime should return null on some error inside', async () => {
    const x = {
      ...googleResponse,
      routes: [
        {
          legs: [{ x: 1 }],
        },
      ],
    };
    const { getTravelTime } = makeFakeGoogleDir(null, x);
    const resp = await getTravelTime(l, l);
    assert.equal(resp, null);
  });
});
