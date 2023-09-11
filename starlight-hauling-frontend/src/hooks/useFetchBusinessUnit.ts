import { useEffect } from 'react';

import { useBusinessContext } from '@root/hooks/useBusinessContext/useBusinessContext';
import { useStores } from '@root/hooks/useStores';

export const useFetchBusinessUnit = () => {
  const { businessUnitStore } = useStores();
  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    if (
      !businessUnitStore.selectedEntity ||
      businessUnitStore.selectedEntity.id !== +businessUnitId
    ) {
      (async () => {
        const entity = await businessUnitStore.requestById(businessUnitId);

        if (entity) {
          businessUnitStore.selectBusinessUnit(entity);
        }
      })();
    }
  }, [businessUnitId, businessUnitStore]);
};
