import { DEFAULT_SKIP, DEFAULT_LIMIT } from '../../../consts/defaults.js';
import validate from '../../../utils/validate.js';
import { getDailyRoutesSchema } from './schema.js';

export const trashapiDailyRoutes = async (_, payload, ctx) => {
  const defaults = {
    skip: DEFAULT_SKIP,
    limit: DEFAULT_LIMIT,
  };

  const { serviceDate, driverId } = validate({
    schema: getDailyRoutesSchema,
    params: payload,
  });

  const result = await ctx.models.DailyRoute.getAllBy({ ...defaults, serviceDate, driverId });

  return result;
};

export const trashapiNotes = async (_, { id }, ctx) => {
  const [comments = [], media = []] = await Promise.all([
    ctx.models.Comment.getAll({ condition: { workOrderId: id } }),
    ctx.models.WorkOrderMedia.getAll({ condition: { workOrderId: id } }),
  ]);

  const notes = [...comments, ...media].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  return notes;
};

export const trashapiNotesCount = async (_, { id }, ctx) => {
  const [comments, media] = await Promise.all([
    ctx.models.Comment.getCount({ workOrderId: id }),
    ctx.models.WorkOrderMedia.getCount({ workOrderId: id }),
  ]);

  const total = Number(comments?.count ?? 0) + Number(media?.count ?? 0);

  return {
    count: total,
  };
};
