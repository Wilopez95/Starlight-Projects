import validate from '../../../utils/validate.js';
import {
  createMasterRouteSchema,
  publishMasterRouteSchema,
  updateMasterRouterGridSchema,
  updateMasterRouterSchema,
} from './schema.js';

export const createMasterRoute = async (_, payload, ctx) => {
  for (let index = 0; index < payload.input.serviceItems.length; index++) {
    const element = payload.input.serviceItems[index];

    if (element.startDate) {
      const [startDate] = element.startDate.split('T');
      element.startDate = startDate;
    }
    if (element.endDate) {
      const [endDate] = element.endDate.split('T');
      element.endDate = endDate;
    }
  }

  const params = validate({ schema: createMasterRouteSchema, params: payload.input });
  const result = await ctx.models.MasterRoute.create(params);
  return result;
};

export const updateMasterRoute = async (_, payload, ctx) => {
  const requestBody = payload.input;

  requestBody?.serviceItems.forEach(service => {
    if (service.startDate) {
      const startDate = service.startDate.split('T')[0];
      service.startDate = startDate;
    }
    if (service.endDate) {
      const endDate = service.endDate.split('T')[0];
      service.endDate = endDate;
    }
  });

  const params = await validate({ schema: updateMasterRouterSchema, params: requestBody });
  const result = await ctx.models.MasterRoute.update(params);

  return result;
};

export const publishMasterRoute = async (_, payload, ctx) => {
  const params = await validate({ schema: publishMasterRouteSchema, params: payload });

  const result = await ctx.models.MasterRoute.publish(params);

  return result;
};

export const unpublishMasterRoute = async (_, payload, ctx) => {
  const { id, force } = payload;
  const result = await ctx.models.MasterRoute.unpublish({ id, force });

  return result;
};

export const finishUpdateMasterRoute = async (_, { id }, ctx) => {
  const result = await ctx.models.MasterRoute.finishPublish(null, id);

  return !!result;
};

export const enableMasterRouteEditMode = async (_, { id }, ctx) => {
  const result = await ctx.models.MasterRoute.enableEditMode({ id, user: ctx.user });
  return result;
};

export const disableMasterRouteEditMode = async (_, { id }, ctx) => {
  const result = await ctx.models.MasterRoute.disableEditMode({ id, user: ctx.user });
  return result;
};

export const updateMasterRouteGrid = async (_, payload, ctx) => {
  const requestBody = payload.input;
  const params = await validate({ schema: updateMasterRouterGridSchema, params: requestBody });
  const result = await ctx.models.MasterRoute.updateRouteMasterGrid(params);

  return result;
};
