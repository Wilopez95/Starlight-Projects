import axios from 'axios';

import ApiError from '../../../errors/ApiError.js';
import { ROUTE_PLANNER_API_URL, TRACING_HEADER } from '../../../config.js';

export const graphql = async ctx => {
  const { tokenId } = ctx.state;

  try {
    const response = await axios.post(`${ROUTE_PLANNER_API_URL}/graphql`, ctx.request.body, {
      headers: {
        Authorization: `Bearer ${tokenId}`,
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
