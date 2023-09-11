import { useCallback, useMemo } from 'react';
import { format, utcToZonedTime } from 'date-fns-tz';

import { useBusinessContext } from './useBusinessContext/useBusinessContext';
import { useStores } from './useStores';
import { useUserContext } from './useUserContext';

export const useTimeZone = (): UseTimeZoneResult => {
  const { businessUnitStore } = useStores();

  const { currentCompany } = useUserContext();
  const { businessUnitId } = useBusinessContext();

  const timeZoneName = currentCompany?.timeZoneName ?? 'America/New_York';

  const selectedBusinessUnit = businessUnitStore.getById(businessUnitId);

  const timeZone: string = useMemo(() => {
    return selectedBusinessUnit?.timeZoneName ?? timeZoneName;
  }, [selectedBusinessUnit?.timeZoneName, timeZoneName]);

  const handleFormat = useCallback(
    (date: Date, formatType: string) => {
      return format(utcToZonedTime(date, timeZone), formatType, { timeZone });
    },
    [timeZone],
  );

  const result = useMemo<UseTimeZoneResult>(() => {
    return {
      timeZone,
      format: handleFormat,
    };
  }, [timeZone, handleFormat]);

  return result;
};

type UseTimeZoneResult = {
  timeZone: string;
  format(date: Date, format: string): string;
};
