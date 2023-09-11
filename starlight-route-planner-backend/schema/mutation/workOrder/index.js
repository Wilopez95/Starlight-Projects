import validate from '../../../utils/validate.js';
import { updateWorkOrderSchema, bulkStatusChange, bulkReschedule } from './schema.js';

export const createComment = async (_, { input }, ctx) => {
  const result = await ctx.models.Comment.create(input);

  return result;
};

export const workOrdersBulkStatusChange = async (_, { input }, ctx) => {
  const params = validate({ schema: bulkStatusChange, params: input });
  const result = await ctx.models.WorkOrder.bulkStatusChange(params);

  return result;
};

export const workOrdersBulkReschedule = async (_, { input }, ctx) => {
  const params = validate({ schema: bulkReschedule, params: input });
  const result = await ctx.models.WorkOrder.bulkReschedule(params);

  return result;
};

export const updateWorkOrder = async (_, { input }, ctx) => {
  const params = validate({ schema: updateWorkOrderSchema, params: input });
  const result = await ctx.models.WorkOrder.update({ ...params });

  return result;
};
