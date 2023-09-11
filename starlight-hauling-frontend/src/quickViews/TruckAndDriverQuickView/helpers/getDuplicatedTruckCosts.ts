import { ITruck, ITruckCost } from '@root/types';

export const getDuplicatedTruckCosts = (trucks?: ITruck[], truckCosts?: ITruckCost[] | null) =>
  truckCosts?.filter(truckCost => trucks?.find(truck => truckCost.truckId === truck.id));
