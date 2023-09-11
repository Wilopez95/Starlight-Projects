import { ITruckAndDriverCost, ITruckCost, ITruckTypeCost } from '@root/types';

const getFormattedCosts = (costs: Array<ITruckTypeCost | ITruckCost>, detailed: boolean) => {
  if (detailed) {
    return costs.map((cost: ITruckTypeCost | ITruckCost) => ({
      ...cost,
      truckAverageCost: undefined,
    }));
  } else {
    return costs.map((cost: ITruckTypeCost | ITruckCost) => ({
      ...cost,
      fuelCost: undefined,
      miscAverageCost: undefined,
      insuranceCost: undefined,
      maintenanceCost: undefined,
      depreciationCost: undefined,
    }));
  }
};

export const getPayloadData = (data: ITruckAndDriverCost) => ({
  id: data.id,
  businessUnitId: data.businessUnitId ?? null,
  changedBy: {
    id: data.changedBy.id,
    name: data?.changedBy?.name ?? '',
  },
  createdAt: data.createdAt,
  date: data.date,
  averageCost: data.averageCost,
  driverAverageCost: data.driverAverageCost,
  truckAverageCost: data.truckAverageCost,
  detailedCosts: data.detailedCosts,
  updatedAt: data.updatedAt,
  truckTypeCosts: data?.truckTypeCosts?.length
    ? getFormattedCosts(data.truckTypeCosts, data.detailedCosts)
    : null,
  truckCosts: data?.truckCosts?.length
    ? getFormattedCosts(data.truckCosts, data.detailedCosts)
    : null,
  driverCosts: data?.driverCosts?.length ? data.driverCosts : null,
});
