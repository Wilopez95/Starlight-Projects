import React, { useEffect, useMemo } from 'react';
import { useFormikContext } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FrequencyTypesWithServiceDays } from '@root/consts';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

import SelectFrequencyDayItem from './SelectDayItem/SelectDayItem';
import { getAvailableServiceDayOptions, getDefaultServiceDaysValue } from './helpers';
import { IServiceDays } from './types';

const ServiceDays: React.FC<IServiceDays> = ({ isReadOnly, serviceIndex }) => {
  const { billableServiceStore } = useStores();
  const intl = useIntl();
  const { values, setFieldValue } = useFormikContext<INewSubscription>();
  const currentService = values.serviceItems[serviceIndex];
  const serviceDaysOfWeek = currentService.serviceDaysOfWeek;

  const frequency = billableServiceStore.frequencies.find(
    ({ id }) => +id === currentService.serviceFrequencyId,
  );

  const serviceDaysPropsPath = `serviceItems[${serviceIndex}].serviceDaysOfWeek`;

  useEffect(() => {
    if (
      frequency &&
      FrequencyTypesWithServiceDays.includes(frequency.type) &&
      isEmpty(serviceDaysOfWeek) &&
      frequency.times
    ) {
      // set default serviceDaysOfWeek
      setFieldValue(serviceDaysPropsPath, getDefaultServiceDaysValue(frequency.times, intl));
    }
  }, [frequency, intl, serviceDaysOfWeek, setFieldValue, serviceDaysPropsPath]);

  const availableDayOptions = useMemo(
    () => getAvailableServiceDayOptions(serviceDaysOfWeek, intl.weekDays),
    [serviceDaysOfWeek, intl.weekDays],
  );

  return (
    <>
      {serviceDaysOfWeek.map((serviceDay, index) => (
        <SelectFrequencyDayItem
          key={serviceDay.day}
          {...{
            index,
            serviceDayOfWeek: serviceDay,
            serviceDaysPropsPath,
            availableDayOptions,
            isReadOnly,
          }}
        />
      ))}
    </>
  );
};

export default observer(ServiceDays);
