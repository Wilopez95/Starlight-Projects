import { ClientRequestType } from '@root/consts';
import { useBusinessContext } from '@root/hooks';

import { INewClientRequest } from '../types';

export const useDefaultValue = (): INewClientRequest => {
  const { businessUnitId } = useBusinessContext();

  return {
    type: ClientRequestType.Unknown,
    businessUnitId,
    searchString: '',
    businessLineId: '',
    customerId: 0,
    jobSiteId: 0,
    projectId: undefined,
    serviceAreaId: undefined,
  };
};
