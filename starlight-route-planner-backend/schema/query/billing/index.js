export const dailyRouteReport = async (_, { dailyRouteId }, { dataSources }) =>
  dataSources.billingAPI.getDailyRouteReport(dailyRouteId);
