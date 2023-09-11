import ThresholdRepo from '../../../repos/threshold.js';

export const getThresholds = async ctx => {
  const condition = ctx.getRequestCondition();

  const { businessLineIds } = ctx.request.validated.query;
  const thresholds = await ThresholdRepo.getInstance(ctx.state).getAll({
    condition,
    businessLineIds,
  });

  ctx.sendArray(thresholds);
};

export const getThresholdById = async ctx => {
  const { id } = ctx.params;

  const threshold = await ThresholdRepo.getInstance(ctx.state).getById({ id });

  ctx.sendObj(threshold);
};

export const editThreshold = async ctx => {
  const { concurrentData } = ctx.state;
  const { id } = ctx.params;
  const { description, applySurcharges } = ctx.request.validated.body;

  const updatedThreshold = await ThresholdRepo.getInstance(ctx.state).updateBy({
    condition: { id },
    concurrentData,
    log: true,
    data: { description, applySurcharges },
  });

  ctx.sendObj(updatedThreshold);
};
