import { useStores } from '../hooks/useStores';
import { IntlConfig } from '../i18n/types';

export const useIntl = (): IntlConfig => {
  const { i18nStore } = useStores();

  return i18nStore.intlConfig;
};
