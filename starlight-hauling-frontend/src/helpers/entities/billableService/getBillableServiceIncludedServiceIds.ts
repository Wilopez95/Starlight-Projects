import { IBillableService } from '@root/types';

export const getBillableServiceIncludedServiceIds = (billableService: IBillableService) => {
  if (!billableService.services) {
    return [];
  }

  return billableService.services.map(billableServiceData => {
    if (typeof billableServiceData === 'number') {
      return billableServiceData;
    }

    return billableServiceData.id;
  });
};
