export const weightTickets = async (_, { dailyRouteId }, ctx) => {
  const result = await ctx.models.WeightTicket.getAll({ condition: { dailyRouteId } });

  return result;
};
