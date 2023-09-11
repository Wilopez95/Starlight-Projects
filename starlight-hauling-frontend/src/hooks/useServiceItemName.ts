import { useStores } from './useStores';

export const useServiceItemName = (id: string | number | undefined | null): string | null => {
  const { billableServiceStore } = useStores();

  const service = billableServiceStore.getById(id);

  if (!service && id) {
    billableServiceStore.requestById(+id);
  }

  return service?.description ?? null;
};
