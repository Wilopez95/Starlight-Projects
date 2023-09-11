import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { FormInput } from '@root/common';
import { useDateIntl } from '@root/helpers/format/date';
import { useIntl } from '@root/i18n/useIntl';
import { type ISubscriptionOnHoldDetails } from '@root/types';

import { useReasonOptions } from '../../hooks';

const I18N_BASE = `components.forms.SubscriptionOnHold.`;
const I18N_BASE_FORM = `${I18N_BASE}Form.`;

const today = new Date();

const SubscriptionOnHoldReasons: React.FC = () => {
  const { t } = useTranslation();
  const reasonOptions = useReasonOptions();

  const formikContext = useFormikContext<ISubscriptionOnHoldDetails>();

  const { values, handleChange, errors, setFieldValue } = formikContext;
  const { dateFormat } = useDateIntl();
  const { firstDayOfWeek } = useIntl();

  return (
    <Layouts.Flex direction="column" flexGrow={1}>
      <Layouts.Padding left="5" right="5">
        <Select
          label={`${t(`${I18N_BASE_FORM}Reason`)}*`}
          nonClearable
          name="reason"
          placeholder={t(`${I18N_BASE_FORM}SelectReason`)}
          options={reasonOptions}
          value={values.reason}
          onSelectChange={setFieldValue}
          error={errors.reason}
        />
      </Layouts.Padding>
      <Layouts.Padding left="5" right="5">
        <FormInput
          label={t(`${I18N_BASE_FORM}ReasonDescription`)}
          name="reasonDescription"
          placeholder={t(`${I18N_BASE_FORM}EnterReasonDescription`)}
          onChange={handleChange}
          value={values.reasonDescription}
          error={errors.reasonDescription}
          area
        />
      </Layouts.Padding>
      <Layouts.Padding left="5" right="5">
        <Calendar
          label={t(`${I18N_BASE_FORM}HoldSubscriptionCalendar`)}
          name="holdSubscriptionUntil"
          withInput
          value={values.holdSubscriptionUntil}
          placeholder={t('Text.SetDate')}
          firstDayOfWeek={firstDayOfWeek}
          dateFormat={dateFormat}
          error={errors.holdSubscriptionUntil}
          minDate={today}
          onDateChange={setFieldValue}
        />
      </Layouts.Padding>
    </Layouts.Flex>
  );
};

export default observer(SubscriptionOnHoldReasons);
