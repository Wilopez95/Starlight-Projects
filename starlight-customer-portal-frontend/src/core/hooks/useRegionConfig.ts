import { useStores } from '@root/core/hooks/useStores';
import { IRegionConfig } from '@root/core/i18n/types';

export const useRegionConfig = (): IRegionConfig => {
  const { i18nStore } = useStores();

  return i18nStore.regionConfig;
};
