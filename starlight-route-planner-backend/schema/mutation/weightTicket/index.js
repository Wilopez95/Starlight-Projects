export const createWeightTicket = async (_, { input, media }, ctx) => {
  const result = await ctx.models.WeightTicket.create(input, media);

  return result;
};

export const updateWeightTicket = async (_, { id, input, media }, ctx) => {
  const result = await ctx.models.WeightTicket.update({ id, input, media });

  return result;
};

export const deleteWeightTicket = async (_, { id }, ctx) => {
  const result = await ctx.models.WeightTicket.delete(id);

  return result;
};
