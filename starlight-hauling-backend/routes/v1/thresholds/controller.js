import * as thresholds from '../../../services/thresholds.js';

export const calculateRecyclingThresholds = async ctx => {
  const data = ctx.request.validated.body;

  const result = await thresholds.calculateRecyclingThresholds(ctx.state, data);

  ctx.sendArray(result);
};
