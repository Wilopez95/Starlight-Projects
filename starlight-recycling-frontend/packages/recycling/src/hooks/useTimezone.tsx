import { useCompanySettings } from './useCompanySettings';
import { useMemo } from 'react';
import { rawTimeZones } from '@vvo/tzdb';
import { useGetHaulingCompanyGeneralSettingsQuery } from '../graphql/api';

export const useTimezone = () => {
  const { timezone, region } = useCompanySettings();
  const rawTimeZone = useMemo(() => rawTimeZones.find((tz) => tz.name === timezone), [timezone]);
  const { data: haulingCompanySettings } = useGetHaulingCompanyGeneralSettingsQuery();
  const companyTimeZone = haulingCompanySettings?.haulingCompanyGeneralSettings?.timeZoneName;
  const rawCompanyTimeZone = useMemo(() => rawTimeZones.find((tz) => tz.name === companyTimeZone), [
    companyTimeZone,
  ]);

  return { timezone, rawTimeZone, rawCompanyTimeZone, region };
};
