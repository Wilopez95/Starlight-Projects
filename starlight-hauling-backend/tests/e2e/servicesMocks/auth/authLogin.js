import nock from 'nock';
import httpStatus from 'http-status';

import { STARLIGHT_AUTH_API_TOKEN } from '../../../../config.js';
import { BASE_URL } from './config.js';

const getDefaultOutput = () => ({
  data: {
    token: STARLIGHT_AUTH_API_TOKEN,
  },
});
const defaultStatus = httpStatus.OK;

const uriPattern = /^\/api\/auth\/v1\/auth\/login$/;

export const authLogin = ({ status = defaultStatus, outputCallback } = {}, baseUrl = BASE_URL) =>
  nock(baseUrl)
    .post(uriPattern, () => true)
    .query(() => true)
    .reply(status, outputCallback || getDefaultOutput);

export default authLogin;
