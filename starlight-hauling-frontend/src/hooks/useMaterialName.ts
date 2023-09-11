import { useStores } from './useStores';

export const useMaterialName = (id: string | number | undefined | null): string | null => {
  const { materialStore } = useStores();

  const service = materialStore.getById(id);

  if (!service && id) {
    materialStore.requestById(+id);
  }

  return service?.description ?? null;
};
