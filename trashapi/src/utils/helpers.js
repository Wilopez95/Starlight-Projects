import { HAULING_HEADERS_GET_KEY, HAULING_HEADERS_GET_VALUE } from '../config.js';

export const checkCoreHeaderValue = req =>
  req.headers[HAULING_HEADERS_GET_KEY] === HAULING_HEADERS_GET_VALUE;
