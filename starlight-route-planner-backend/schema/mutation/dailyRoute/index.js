import validate from '../../../utils/validate.js';
import {
  createDailyRouteSchema,
  updateDailyRouteSchema,
  updateDailyRouteQuickViewSchema,
} from './schema.js';

export const createDailyRoute = async (_, { businessUnitId, input }, ctx) => {
  const params = validate({ schema: createDailyRouteSchema, params: input });
  const result = await ctx.models.DailyRoute.create(businessUnitId, {
    ...params,
  });

  return result;
};

export const updateDailyRoute = async (_, { input }, ctx) => {
  const params = validate({ schema: updateDailyRouteSchema, params: input });
  const result = await ctx.models.DailyRoute.update(params);
  return result;
};

export const updateDailyRouteQuickViewInfo = async (_, { id, input }, ctx) => {
  const params = validate({ schema: updateDailyRouteQuickViewSchema, params: input });
  const result = await ctx.models.DailyRoute.updateOnDashboardQuickViewInfo({ id, ...params });
  return result;
};

export const enableDailyRouteEditMode = async (_, { id }, ctx) => {
  const result = await ctx.models.DailyRoute.enableEditMode({ id, user: ctx.user });
  return result;
};

export const disableDailyRouteEditMode = async (_, { id }, ctx) => {
  const result = await ctx.models.DailyRoute.disableEditMode({ id, user: ctx.user });
  return result;
};
