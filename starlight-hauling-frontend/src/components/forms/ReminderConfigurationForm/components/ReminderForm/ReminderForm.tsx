import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { startOfTomorrow } from 'date-fns';
import { getIn, useFormikContext } from 'formik';
import { omit } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { useDateIntl } from '@root/helpers/format/date';
import { useIntl } from '@root/i18n/useIntl';
import { INewOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IConfigurableOrder, IConfigurableReminderSchedule } from '@root/types';

interface IReminderForm {
  isAnnualReminder?: boolean;
  size?: string;
}

const tomorrow = startOfTomorrow();

const I18N_BASE = `components.forms.ReminderConfigurationForm.`;
const I18N_BASE_FORM = `${I18N_BASE}Form.`;

const ReminderForm: React.FC<IReminderForm> = ({ isAnnualReminder = false, size = '190px' }) => {
  const { values, errors, handleChange, setFieldValue, setErrors } = useFormikContext<
    INewOrders | INewSubscription | IConfigurableOrder | IConfigurableReminderSchedule
  >();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();
  const { t } = useTranslation();
  const valuesPath = isAnnualReminder ? 'annualReminderConfig.' : '';

  const handleBoxChange = useCallback(
    e => {
      handleChange(e);
      setErrors(omit(errors, `${valuesPath}informBy`));
    },
    [valuesPath, errors, handleChange, setErrors],
  );

  return (
    <>
      <Layouts.Box width={size}>
        <Calendar
          name={`${valuesPath}date`}
          label={isAnnualReminder ? t(`${I18N_BASE_FORM}AnnualEventReminder`) : ''}
          withInput
          value={getIn(values, `${valuesPath}date`)}
          error={getIn(errors, `${valuesPath}date`)}
          dateFormat={dateFormat}
          firstDayOfWeek={firstDayOfWeek}
          formatDate={formatDate}
          minDate={tomorrow}
          onDateChange={setFieldValue}
        />
      </Layouts.Box>

      <Layouts.Margin top="1" bottom="1" left={isAnnualReminder ? '0' : '3'}>
        {isAnnualReminder ? (
          <Typography
            color="secondary"
            as="label"
            shade="desaturated"
            variant="bodyMedium"
            htmlFor="popupNote"
          >
            <Layouts.Padding right="1" bottom="1">
              {t(`${I18N_BASE_FORM}SendAnnualEventReminderBy`)}
            </Layouts.Padding>
          </Typography>
        ) : null}
        <Layouts.Flex alignItems="flex-start">
          <Checkbox
            name={`${valuesPath}informBy.informByApp`}
            value={getIn(values, `${valuesPath}informBy.informByApp`)}
            error={getIn(errors, `${valuesPath}informBy`)}
            disabled={!getIn(values, `${valuesPath}date`)}
            onChange={handleBoxChange}
          >
            {t(`${I18N_BASE_FORM}App`)}
          </Checkbox>
          <Layouts.Margin right="2" left="2">
            <Checkbox
              name={`${valuesPath}informBy.informByEmail`}
              value={getIn(values, `${valuesPath}informBy.informByEmail`)}
              error={getIn(errors, `${valuesPath}informBy`)}
              disabled={!getIn(values, `${valuesPath}date`)}
              onChange={handleBoxChange}
            >
              {t(`${I18N_BASE_FORM}Email`)}
            </Checkbox>
          </Layouts.Margin>
          <Checkbox
            name={`${valuesPath}informBy.informBySms`}
            value={getIn(values, `${valuesPath}informBy.informBySms`)}
            error={getIn(errors, `${valuesPath}informBy`)}
            disabled={!getIn(values, `${valuesPath}date`)}
            onChange={handleBoxChange}
          >
            {t(`${I18N_BASE_FORM}Phone`)}
          </Checkbox>
        </Layouts.Flex>
        <Layouts.ValidationError>{getIn(errors, `${valuesPath}informBy`)}</Layouts.ValidationError>
      </Layouts.Margin>
    </>
  );
};

export default observer(ReminderForm);
