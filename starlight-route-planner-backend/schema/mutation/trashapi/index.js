import validate from '../../../utils/validate.js';
import { HaulingService } from '../../../services/hauling.js';
import { updateDailyRouteInput, updateWorkOrderSchema } from './schema.js';

export const trashapiUpdateDailyRoute = async (_, { id, input }, ctx) => {
  const { status, completedAt } = validate({
    schema: updateDailyRouteInput,
    params: { status: input.status, completedAt: input.completedAt },
  });

  const result = await ctx.models.DailyRoute.updateFromDriver({
    id,
    ...input,
    status,
    completedAt,
  });

  return result;
};

export const trashapiUpdateWorkOrder = async (_, { id, input }, ctx) => {
  const params = validate({ schema: updateWorkOrderSchema, params: input });
  if (input.media) {
    const { workOrderId, isIndependent } = await ctx.models.WorkOrder.getById(id, [
      'workOrderId',
      'isIndependent',
    ]);

    await HaulingService.uploadWorkOrderMedia(isIndependent, {
      ctx,
      id: workOrderId,
      input: {
        file: input.media,
      },
    });
  }
  const result = await ctx.models.WorkOrder.updateFromDriver({ id, ...params });
  return result;
};

export const trashapiCreateWeightTicket = async (_, { input, url }, ctx) => {
  const result = await ctx.models.WeightTicket.createFromDriver({ ...input, url });

  return result;
};

export const trashapiUpdateWeightTicket = async (_, { id, input, url }, ctx) => {
  const result = await ctx.models.WeightTicket.updateFromDriver({ id, ...input, url });

  return result;
};
