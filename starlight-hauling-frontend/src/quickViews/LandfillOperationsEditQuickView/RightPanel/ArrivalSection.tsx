import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Calendar,
  Checkbox,
  InputContainer,
  Layouts,
  TimePicker,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FormInput } from '@root/common';
import { useDateIntl } from '@root/helpers/format/date';
import { useIntl } from '@root/i18n/useIntl';
import { IEditableLandfillOperation } from '@root/types';

const I18N_PATH = 'components.forms.LandfillOperationEdit.RightPanel.';

export const ArrivalSection: React.FC = () => {
  const { values, handleChange, errors, setFieldValue } =
    useFormikContext<IEditableLandfillOperation>();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const handleNowClick = useCallback(() => {
    const now = new Date();

    setFieldValue('arrivalDate', now);
    setFieldValue('timeIn', now);
  }, [setFieldValue]);

  const { dateFormat } = useDateIntl();

  return (
    <Layouts.Grid rows={1} columns={5} gap="2">
      <Layouts.Cell width={1}>
        <Calendar
          label={t(`${I18N_PATH}ArrivalDate`)}
          name="arrivalDate"
          value={values.arrivalDate}
          placeholder={t('Text.SetDate')}
          firstDayOfWeek={firstDayOfWeek}
          dateFormat={dateFormat}
          error={errors.arrivalDate}
          maxDate={values.departureDate}
          onDateChange={setFieldValue}
          withInput
        />
      </Layouts.Cell>

      <Layouts.Cell width={1}>
        <TimePicker
          label={t(`${I18N_PATH}ArrivalTime`)}
          name="timeIn"
          value={values.arrivalDate}
          error={errors.timeIn}
          onChange={setFieldValue}
        />
      </Layouts.Cell>

      <Layouts.Cell width={1}>
        <Layouts.Flex justifyContent="space-between">
          <Layouts.Box width="50%">
            <Layouts.Margin top="3.5" right="1">
              <Button onClick={handleNowClick} full>
                {t('Text.Now')}
              </Button>
            </Layouts.Margin>
          </Layouts.Box>
          <Layouts.Box width="50%">
            <Layouts.Margin left="1">
              <InputContainer label={t(`${I18N_PATH}UseTare`)} error={errors.arrivalUseTare} center>
                <Checkbox
                  name="arrivalUseTare"
                  value={values.arrivalUseTare}
                  onChange={handleChange}
                  disabled
                />
              </InputContainer>
            </Layouts.Margin>
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Cell>
      <Layouts.Cell width={1} />
      <Layouts.Cell width={1}>
        <FormInput
          label={t(`${I18N_PATH}WeightIn`)}
          name="weightIn"
          error={errors.weightIn}
          value={values.weightIn}
          onChange={handleChange}
          type="number"
        />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};
