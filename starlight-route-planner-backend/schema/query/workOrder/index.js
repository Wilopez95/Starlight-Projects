import validate from '../../../utils/validate.js';
import { getWorkOrdersDailyRouteSchema, getWorkOrdersSchema } from './schema.js';

export const workOrder = async (_, { id }, ctx) => {
  const result = await ctx.models.WorkOrder.getBy({ condition: { displayId: id } });

  return result;
};

export const workOrders = async (_, { businessUnitId, input, searchInput }, ctx) => {
  const validatedInput = validate({
    schema: getWorkOrdersSchema,
    params: input,
  });

  const result = await ctx.models.WorkOrder.getAllPaginated(businessUnitId, {
    ...validatedInput,
    searchInput,
  });
  return result;
};

export const workOrdersDailyRoute = async (_, { businessUnitId, input }, ctx) => {
  const validatedInput = validate({
    schema: getWorkOrdersDailyRouteSchema,
    params: input,
  });

  const result = await ctx.models.WorkOrder.getAllBy({ businessUnitId, ...validatedInput });
  return result;
};

export const checkWorkOrdersRouteStatus = async (_, { ids }, ctx) => {
  const result = await ctx.models.WorkOrder.checkItemsRouteStatus(ids);

  return result;
};

export const workOrderHistory = async (_, { id }, ctx) => {
  const result = await ctx.models.WorkOrderHistory.getWorkOrderHistory(id);

  return result;
};
