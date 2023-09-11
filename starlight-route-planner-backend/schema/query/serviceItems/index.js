export const checkServiceItemsRouteStatus = async (_, { ids }, ctx) => {
  const result = await ctx.models.ServiceItem.checkItemsRouteStatus(ids);

  return result;
};
