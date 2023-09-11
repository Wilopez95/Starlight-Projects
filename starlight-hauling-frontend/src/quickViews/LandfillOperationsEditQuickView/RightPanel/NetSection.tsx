import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { intervalToDuration, isBefore, set } from 'date-fns';
import { useFormikContext } from 'formik';

import { FormInput } from '@root/common';
import { IEditableLandfillOperation } from '@root/types';

const I18N_PATH = 'components.forms.LandfillOperationEdit.RightPanel.';

export const NetSection: React.FC = () => {
  const { values, handleChange } = useFormikContext<IEditableLandfillOperation>();

  const { t } = useTranslation();

  const timeOnLandfill = useMemo(() => {
    const arrivalDate = values.arrivalDate;
    const departureDate = values.departureDate;

    const fullArrivalDate = set(arrivalDate, {
      hours: arrivalDate.getHours(),
      minutes: arrivalDate.getMinutes(),
      seconds: arrivalDate.getSeconds(),
      milliseconds: 0,
    });

    const fullDepartureDate = set(departureDate, {
      hours: departureDate.getHours(),
      minutes: departureDate.getMinutes(),
      seconds: departureDate.getSeconds(),
      milliseconds: 0,
    });

    const isRangeValid = isBefore(fullArrivalDate, fullDepartureDate);

    if (!isRangeValid) {
      return undefined;
    }

    const interval = intervalToDuration({
      start: fullArrivalDate,
      end: fullDepartureDate,
    });

    const formatValue = (value = 0) => {
      if (value < 9) {
        return `0${value}`;
      }

      return value.toString();
    };

    let hours = interval.hours ?? 0;

    if (interval.days) {
      hours += interval.days * 24;
    }
    if (interval.months) {
      hours += interval.months * 730;
    }
    if (interval.years) {
      hours += interval.years * 8760;
    }

    return `${formatValue(hours)}:${formatValue(interval.minutes)}:${formatValue(
      interval.seconds,
    )}`;
  }, [values.arrivalDate, values.departureDate]);

  const timeOnLandfillErrorMessage = t(`${I18N_PATH}IncorrectTime`);

  return (
    <Layouts.Grid columns={5} gap="2">
      <Layouts.Cell width={1}>
        <FormInput
          label={t(`${I18N_PATH}TimeOnLandfill`)}
          name="timeOnLandfill"
          value={timeOnLandfill}
          onChange={handleChange}
          error={timeOnLandfill ? undefined : timeOnLandfillErrorMessage}
          noError={!!timeOnLandfill}
          disabled
        />
      </Layouts.Cell>
      <Layouts.Cell left={5} width={1}>
        <FormInput
          label={t(`${I18N_PATH}NetWeight`)}
          onChange={handleChange}
          disabled
          value={values.netWeight}
          name="netWeight"
          noError
        />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};
