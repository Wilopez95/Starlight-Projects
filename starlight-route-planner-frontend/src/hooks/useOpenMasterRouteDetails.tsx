import { useCallback } from 'react';

import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';

import { useBusinessContext } from './useBusinessContext/useBusinessContext';
import { useStores } from './useStores';

export const useOpenMasterRouteDetails = () => {
  const { masterRoutesStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const serviceItemsAssignmentInfo = masterRoutesStore.serviceItemsAssignmentInfo;

  return useCallback(
    (routeName: string) => {
      const itemAssignmentInfo = serviceItemsAssignmentInfo.get(routeName);

      if (!itemAssignmentInfo?.id) {
        return;
      }

      const url = pathToUrl(Paths.DispatchModule.MasterRoute, {
        businessUnit: businessUnitId,
        id: itemAssignmentInfo.id,
      });

      const target = url.includes('master-routes') ? '_self' : '_blank';
      window.open(url, target);
    },
    [serviceItemsAssignmentInfo, businessUnitId],
  );
};
