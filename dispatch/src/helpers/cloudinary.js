/* eslint-disable camelcase   */
import * as R from 'ramda';
import moment from 'moment';
import axios from 'axios';
import sha1 from 'sha1';
import { CLOUDINARY_SECRET, CLOUDINARY_KEY } from './config';

export const urlErrorMessage = 'The path should be url';
export const angleErrorMessage = 'The angle should be number';
export const sizeErrorMessage = 'The size should be number';
export const timeoutErrorMessage = 'Request timed out performing operation. Retry again.';

export const makeUrl = (...args) => args.join('/').replace(/\/\//, '/');

export const headers = { 'Content-Type': 'application/json' };

export const rest = axios.create({
  baseURL: 'https://api.cloudinary.com/',
  headers,
  timeout: 15000,
});

export const sign = (params) =>
  R.pipe(
    R.keys,
    R.sort((a, b) => {
      if (a > b) {
        return 1;
      }
      return -1;
    }),
    R.map((key) => `${key}=${params[key]}`),
    R.join('&'),
    (str) => str + CLOUDINARY_SECRET,
    sha1,
  )(params);

export const uploadUrl = '/image/upload';

export const upload = async (image, public_id, momentFake = moment) => {
  const timestamp = momentFake().unix();
  const signature = sign({ public_id, timestamp, overwrite: true });
  try {
    return await rest.post(makeUrl('v1_1', 'drjl74ggo', uploadUrl), {
      file: image,
      overwrite: true,
      public_id,
      api_key: CLOUDINARY_KEY,
      timestamp,
      signature,
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      throw new Error(timeoutErrorMessage);
    }
    const message = R.path(['response', 'data', 'error', 'message'], err);
    const isErroSizeMessage = /(URI byte size should not be > \d+(\.\d)*)/i.test(message);
    if (isErroSizeMessage) {
      throw new Error('The file you’re trying to upload is too big.');
    }

    if (!isErroSizeMessage && message) {
      throw new Error(message);
    }
    throw err;
  }
};

export const makeRotatedUrl = (url, angle) => {
  if (!/\//g.test(url)) {
    throw new Error(urlErrorMessage);
  }

  if (isNaN(Number(angle))) {
    throw new Error(angleErrorMessage);
  }

  const parts = url.split('/');
  const [imageName] = parts.slice(-1);
  const public_id = imageName.split('.')[0];
  const rotatedUrl = parts
    .slice(0, -1)
    .concat([`a_${angle}`], [imageName])
    .join('/');
  return { rotatedUrl, public_id };
};

export const makeThumbnailUrl = (url, size) => {
  if (/^data:/.test(url)) {
    return url;
  }

  if (!/\//g.test(url)) {
    throw new Error(urlErrorMessage);
  }

  if (isNaN(Number(size))) {
    throw new Error(sizeErrorMessage);
  }
  const parts = url.split('/');
  const [imageName] = parts.slice(-1);
  return parts
    .slice(0, -1)
    .concat([`w_${size},c_scale`], [imageName])
    .join('/');
};
