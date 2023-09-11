/* eslint-disable camelcase, babel/camelcase  */
import sinon from 'sinon';
import {
  upload,
  sign,
  uploadUrl,
  makeRotatedUrl,
  makeThumbnailUrl,
  rest,
  makeUrl,
  urlErrorMessage,
  angleErrorMessage,
  sizeErrorMessage,
  timeoutErrorMessage,
} from '../cloudinary';

const apiVersion = 'v1_1';
const cloudName = 'drjl74ggo';

const api_key = undefined;

const moment = () => ({ unix: () => 1 });

describe('cloudinary', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should transform url to rotate', () => {
    const public_id = 'd_54';
    const u = a =>
      a
        ? `http://example/a/b/c/a_${a}/${public_id}.jpg`
        : `http://example/a/b/c/${public_id}.jpg`;
    const url = u();
    const angle = 45;
    const expected = { rotatedUrl: u(angle), public_id };
    const result = makeRotatedUrl(url, angle);
    expect(result).toEqual(expected);
  });

  it('should transform url to thumbnail', () => {
    const u = a =>
      a
        ? `http://example/a/b/c/w_${a},c_scale/d_54.jpg`
        : 'http://example/a/b/c/d_54.jpg';

    const url = u();
    const size = 45;
    const expected = u(size);
    const result = makeThumbnailUrl(url, size);
    expect(result).toBe(expected);

    const b64 = 'data:base64';
    expect(makeThumbnailUrl(b64, size)).toBe(b64);
  });

  it('upload', async () => {
    const image = '123';
    const fileName = 'name';

    const response = {
      id: 1,
      fileName,
      url: '123',
    };

    sandbox.stub(rest, 'post').returns(response);

    const params = {
      file: image,
      overwrite: true,
      public_id: fileName,
      api_key,
      timestamp: moment().unix(),
      signature: sign({
        public_id: fileName,
        timestamp: moment().unix(),
        overwrite: true,
      }),
    };

    const result = await upload(image, fileName, moment, rest);

    expect(result).toEqual(response);
    expect(rest.post.args[0][0]).toBe(
      makeUrl(apiVersion, cloudName, uploadUrl),
    );
    expect(rest.post.args[0][1]).toEqual(params);
  });

  it('upload should return human readable error on bad image', async () => {
    const image = '123';
    const fileName = 'name';

    const response = {
      response: {
        data: {
          error: {
            message: 'Ooops, bad data',
          },
        },
      },
    };

    sandbox.stub(rest, 'post').returns(Promise.reject(response));

    const params = {
      file: image,
      overwrite: true,
      public_id: fileName,
      api_key,
      timestamp: moment().unix(),
      signature: sign({
        public_id: fileName,
        timestamp: moment().unix(),
        overwrite: true,
      }),
    };

    try {
      await upload(image, fileName, moment, rest);
    } catch (err) {
      expect(err.message).toBe(response.response.data.error.message);
    }

    expect(rest.post.args[0][0]).toBe(
      makeUrl(apiVersion, cloudName, uploadUrl),
    );
    expect(rest.post.args[0][1]).toEqual(params);
  });

  it('upload should return human readable error on timeout exceeded', async () => {
    const image = '123';
    const fileName = 'name';

    const response = { code: 'ECONNABORTED', message: timeoutErrorMessage };

    sandbox.stub(rest, 'post').returns(Promise.reject(response));

    const params = {
      file: image,
      overwrite: true,
      public_id: fileName,
      api_key,
      timestamp: moment().unix(),
      signature: sign({
        public_id: fileName,
        timestamp: moment().unix(),
        overwrite: true,
      }),
    };

    try {
      await upload(image, fileName, moment, rest);
    } catch (err) {
      expect(err.message).toBe(response.message);
    }

    expect(rest.post.args[0][0]).toBe(
      makeUrl(apiVersion, cloudName, uploadUrl),
    );
    expect(rest.post.args[0][1]).toEqual(params);
  });

  it('upload should catch server error', async () => {
    const error = new Error('error');
    const image = '123';
    const fileName = 'name';

    sandbox.stub(rest, 'post').returns(Promise.reject(error));
    try {
      await upload(image, fileName, moment, rest);
    } catch (err) {
      expect(err).toBe(error);
    }
  });

  it('makeRotatedUrl should catch error', () => {
    try {
      makeRotatedUrl(null, null);
    } catch (err) {
      expect(err.message).toBe(urlErrorMessage);
    }

    try {
      makeRotatedUrl('hello', null);
    } catch (err) {
      expect(err.message).toBe(urlErrorMessage);
    }

    try {
      makeRotatedUrl('hello/hello', 'qwer');
    } catch (err) {
      expect(err.message).toBe(angleErrorMessage);
    }
  });

  it('makeThumbnailUrl should catch error', () => {
    try {
      makeThumbnailUrl(null, null);
    } catch (err) {
      expect(err.message).toBe(urlErrorMessage);
    }

    try {
      makeThumbnailUrl('hello', null);
    } catch (err) {
      expect(err.message).toBe(urlErrorMessage);
    }

    try {
      makeThumbnailUrl('hello/hello', 'qwer');
    } catch (err) {
      expect(err.message).toBe(sizeErrorMessage);
    }
  });
});
