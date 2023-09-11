import React, { useEffect } from 'react';

import { useStores, useTimeZone } from '@root/core/hooks';
import { Regions } from '@root/core/i18n/config/region';

export const InitRegion: React.FunctionComponent = () => {
  const { i18nStore } = useStores();
  const { timeZone } = useTimeZone();

  useEffect(() => {
    import('@vvo/tzdb').then(({ rawTimeZones }) => {
      const currentTimeZone = rawTimeZones.find(
        (timeZoneOption) => timeZoneOption.name === timeZone,
      );

      if (currentTimeZone) {
        i18nStore.setRegion(currentTimeZone.countryCode.toUpperCase() as Regions);
      }
    });
  }, [i18nStore, timeZone]);

  return null;
};
