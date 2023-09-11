import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';
import { getStoredFiltering } from '@root/helpers/storedFiltering';

export const defaultValues = (lobId: number): IHaulingServiceItemsParams => {
  const storedFiltering = getStoredFiltering();
  return storedFiltering
    ? storedFiltering
    : {
        businessLineId: lobId,
        frequencyIds: [],
        serviceAreaIds: undefined,
        materialIds: undefined,
        equipmentIds: undefined,
        serviceDaysOfWeek: undefined,
        routeId: undefined,
      };
};
