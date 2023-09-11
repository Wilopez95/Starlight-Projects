import { useCallback, useMemo } from 'react';
import { format } from 'date-fns-tz';

import { useBusinessContext } from './useBusinessContext/useBusinessContext';
import { useStores } from './useStores';
import { useUserContext } from './useUserContext';

export const useTimeZone = (): UseTimeZoneResult => {
  const { businessUnitStore } = useStores();

  const { currentUser } = useUserContext();
  const { businessUnitId } = useBusinessContext();

  const timeZoneName = currentUser?.company?.timeZoneName ?? 'America/New_York';

  const selectedBusinessUnit = businessUnitStore.getById(businessUnitId);

  const timeZone: string = useMemo(
    () => selectedBusinessUnit?.timeZoneName ?? timeZoneName,
    [selectedBusinessUnit?.timeZoneName, timeZoneName],
  );

  /** *
   * @deprecated use `const { formatDateTime } = useIntl();`
   */
  const handleFormat = useCallback(
    (date: Date, formatType: string) => format(date, formatType),
    [],
  );

  const result = useMemo<UseTimeZoneResult>(
    () => ({
      timeZone,
      format: handleFormat,
    }),
    [timeZone, handleFormat],
  );

  return result;
};

type UseTimeZoneResult = {
  timeZone: string;
  format: (date: Date, format: string) => string;
};
