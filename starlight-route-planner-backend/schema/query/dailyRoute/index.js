import { DEFAULT_SKIP, DEFAULT_LIMIT } from '../../../consts/defaults.js';
import validate from '../../../utils/validate.js';
import { getDailyRoutesDashboardSchema, getDailyRoutesSchema } from './schema.js';

export const availableDailyRouteColor = async (_, payload, ctx) => {
  const result = await ctx.models.DailyRoute.getAvailableColor();

  return result;
};

export const dailyRoute = async (_, payload, ctx) => {
  const result = await ctx.models.DailyRoute.getById(payload.id);

  return result;
};

export const dailyRoutes = async (_, payload, ctx) => {
  const defaults = {
    skip: DEFAULT_SKIP,
    limit: DEFAULT_LIMIT,
  };

  const { businessUnitId, input } = validate({
    schema: getDailyRoutesSchema,
    params: payload,
  });

  const result = await ctx.models.DailyRoute.getAllBy({ ...defaults, ...input, businessUnitId });

  return result;
};

export const dailyRoutesCount = async (_, payload, ctx) => {
  const result = await ctx.models.DailyRoute.getCount(payload);

  return result;
};

export const dailyRoutesDashboard = async (_, payload, ctx) => {
  const { businessUnitId, input, searchInput } = validate({
    schema: getDailyRoutesDashboardSchema,
    params: payload,
  });

  const result = await ctx.models.DailyRoute.getAllForDashboardsBy({
    ...input,
    businessUnitId,
    searchInput,
  });

  return result;
};

export const dailyRouteHistory = async (_, { id }, ctx) => {
  const result = await ctx.models.DailyRouteHistory.getDailyRouteHistory(id);

  return result;
};
