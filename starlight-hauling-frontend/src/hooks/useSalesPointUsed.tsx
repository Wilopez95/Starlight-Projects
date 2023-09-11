import { useBusinessContext } from '@root/hooks/useBusinessContext/useBusinessContext';
import { useStores } from '@root/hooks/useStores';

export const useSalesPointUsed = () => {
  const { businessLineStore } = useStores();
  const { businessLineId } = useBusinessContext();

  const selectedBusinessLineId = businessLineStore.getById(businessLineId);

  return selectedBusinessLineId?.spUsed;
};
