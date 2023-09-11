import { FC, useEffect } from 'react';
import i18n from '../../i18n';
import { useCurrency } from '../../hooks/useCurrency';
import { useRegion } from '../../hooks/useRegion';

export const LoadCompanySettings: FC = () => {
  const currency = useCurrency();
  const region = useRegion();

  useEffect(() => {
    // @ts-ignore
    i18n.emit('currencyChanged', currency);
  }, [currency]);

  useEffect(() => {
    // @ts-ignore
    i18n.emit('regionChanged', region);
  }, [region]);

  return null;
};

export default LoadCompanySettings;
