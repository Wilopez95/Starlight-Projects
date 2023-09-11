export const getWeightOutOrderInitialValues = (order: any) => ({
  weightIn: order.weightIn,
  weightInType: order.weightInType,
  arrivedAt: order.arrivedAt,
  departureAt: order.departureAt,
  bypassScale: order.bypassScale,
  weightOut: order.weightOut,
  weightOutSource: order.weightOutSource,
  weightOutType: order.weightOutType,
  weightOutUnit: order.weightOutUnit,
  weightOutTimestamp: order.weightOutTimestamp,
});
