import validate from '../../../utils/validate.js';
import { getMasterRoutesSchema, getMasterRouteGridSchema } from './schema.js';

export const masterRoutes = async (_, payload, ctx) => {
  const { businessUnitId, input } = validate({
    schema: getMasterRoutesSchema,
    params: payload,
  });

  const result = await ctx.models.MasterRoute.getMasterRoutes({ businessUnitId, ...input });

  return result;
};

export const updatingMasterRoutesList = async (_, payload, ctx) => {
  const result = await ctx.models.MasterRoute.getCurrentlyUpdatingList(payload.businessUnitId);

  return result;
};

export const masterRoute = async (_, payload, ctx) => {
  const result = await ctx.models.MasterRoute.getByIdWithRelations(payload.id);

  return result;
};

export const masterRoutesCount = async (_, payload, ctx) => {
  const result = await ctx.models.MasterRoute.getMasterRoutesCount(payload.businessUnitId);

  return result;
};

export const serviceItemsAssignmentInfo = async (_, payload, ctx) => {
  const result = await ctx.models.MasterRoute.getServiceItemsAssignmentInfo();

  return result;
};

export const availableMasterRouteColor = async (_, payload, ctx) => {
  const result = await ctx.models.MasterRoute.getAvailableMasterRouteColor();

  return result;
};

export const masterRouteGrid = async (_, payload, ctx) => {
  const { businessUnitId, filters } = validate({
    schema: getMasterRouteGridSchema,
    params: payload,
  });
  const result = await ctx.models.MasterRoute.getMasterRouteGrid(
    { businessUnitId, ...filters },
    ctx,
  );
  return result;
};
