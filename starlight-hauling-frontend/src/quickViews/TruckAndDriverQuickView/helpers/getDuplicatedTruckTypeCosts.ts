import { ITruckType, ITruckTypeCost } from '@root/types';

export const getDuplicatedTruckTypeCosts = (
  truckTypes?: ITruckType[],
  truckTypeCosts?: ITruckTypeCost[] | null,
) =>
  truckTypeCosts?.filter(truckCost =>
    truckTypes?.find(truck => truckCost.truckTypeId === truck.id),
  );
