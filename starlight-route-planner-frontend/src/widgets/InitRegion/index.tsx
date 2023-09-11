import React, { useEffect } from 'react';

import { Regions } from '@root/i18n/config/region';
import { useStores, useTimeZone } from '@hooks';

export const InitRegion: React.FunctionComponent = () => {
  const { i18nStore } = useStores();
  const { timeZone } = useTimeZone();

  useEffect(() => {
    import('@vvo/tzdb').then(({ rawTimeZones }) => {
      const currentTimeZone = rawTimeZones.find(timeZoneOption => timeZoneOption.name === timeZone);

      if (currentTimeZone) {
        i18nStore.setRegion(currentTimeZone.countryCode.toUpperCase() as Regions);
      }
    });
  }, [i18nStore, timeZone]);

  return null;
};
