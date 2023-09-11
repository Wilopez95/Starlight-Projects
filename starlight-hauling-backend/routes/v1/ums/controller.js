import axios from 'axios';

import ApiError from '../../../errors/ApiError.js';
import { UMS_SERVICE_API_URL, TRACING_HEADER } from '../../../config.js';

export const graphql = async ctx => {
  const { umsAccessToken } = ctx.state.userTokenData;

  try {
    const response = await axios.post(`${UMS_SERVICE_API_URL}/graphql`, ctx.request.body, {
      headers: {
        Authorization: `Bearer ${umsAccessToken}`,
        [TRACING_HEADER]: ctx.state.reqId,
      },
    });
    ctx.body = response.data;
  } catch (err) {
    ctx.logger.error(err);
    if (err.response) {
      ctx.body = err.response.data;
      ctx.status = err.response.status;

      return;
    }

    throw ApiError.unknown();
  }
};
