import { HaulingService } from '../../../services/hauling.js';

export const syncJobSitesFromHauling = async (_, __, { user }) =>
  HaulingService.syncJobSitesFromHauling({ schemaName: user.schemaName });

export const uploadWorkOrderMedia = async (_, { id, input }, ctx) => {
  const { workOrderId, isIndependent } = await ctx.models.WorkOrder.getById(id, [
    'workOrderId',
    'isIndependent',
  ]);

  const result = await HaulingService.uploadWorkOrderMedia(isIndependent, {
    ctx,
    id: workOrderId,
    input,
  });

  return result;
};

export const deleteWorkOrderMedia = async (_, { ids, workOrderId }, ctx) => {
  const { isIndependent } = await ctx.models.WorkOrder.getById(workOrderId, ['isIndependent']);

  await ctx.dataSources.haulingAPI.deleteWorkOrderMedia(ids, {
    isIndependent,
  });

  return ids;
};
