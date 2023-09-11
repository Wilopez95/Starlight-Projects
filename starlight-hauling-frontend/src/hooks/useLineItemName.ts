import { useStores } from './useStores';

export const useLineItemName = (id: string | number | undefined | null): string | null => {
  const { lineItemStore } = useStores();
  const lineItem = lineItemStore.getById(id);

  if (!lineItem && id) {
    lineItemStore.requestById(+id);
  }

  return lineItem?.description ?? null;
};
