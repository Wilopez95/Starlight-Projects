export const getArrivalLoadOrderInitialValues = (order: any) => ({
  arrivedAt: order.arrivedAt,
  departureAt: order.departureAt || null,
  weightIn: order.weightIn,
  weightOut: order.weightOut,
});
