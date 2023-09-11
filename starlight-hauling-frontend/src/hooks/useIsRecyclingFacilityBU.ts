import { useMemo } from 'react';

import { useStores } from '@root/hooks/useStores';
import { BusinessUnitType } from '@root/types';

export const useIsRecyclingFacilityBU = () => {
  const { businessUnitStore } = useStores();

  return useMemo(
    () => businessUnitStore.selectedEntity?.type === BusinessUnitType.RECYCLING_FACILITY,
    [businessUnitStore.selectedEntity?.type],
  );
};
