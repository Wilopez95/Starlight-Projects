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

export const DepartureSection: React.FC = () => {
  const { values, handleChange, errors, setFieldValue } =
    useFormikContext<IEditableLandfillOperation>();

  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const handleNowClick = useCallback(() => {
    const now = new Date();

    setFieldValue('departureDate', now);
    setFieldValue('timeOut', now);
  }, [setFieldValue]);

  const { dateFormat } = useDateIntl();

  return (
    <Layouts.Grid rows={1} columns={5} gap="2">
      <Layouts.Cell width={1}>
        <Calendar
          label={t(`${I18N_PATH}DepartureDate`)}
          name="departureDate"
          value={values.departureDate}
          placeholder={t('Text.SetDate')}
          firstDayOfWeek={firstDayOfWeek}
          dateFormat={dateFormat}
          error={errors.departureDate}
          minDate={values.arrivalDate}
          onDateChange={setFieldValue}
          withInput
        />
      </Layouts.Cell>
      <Layouts.Cell width={1}>
        <TimePicker
          label={t(`${I18N_PATH}DepartureTime`)}
          name="timeOut"
          value={values.departureDate}
          error={errors.timeOut}
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
              <InputContainer
                label={t(`${I18N_PATH}UseTare`)}
                error={errors.departureUseTare}
                center
              >
                <Checkbox
                  name="departureUseTare"
                  value={values.departureUseTare}
                  onChange={handleChange}
                />
              </InputContainer>
            </Layouts.Margin>
          </Layouts.Box>
        </Layouts.Flex>
      </Layouts.Cell>

      {values.departureUseTare ? (
        <>
          <Layouts.Cell width={1}>
            <FormInput
              label={t(`${I18N_PATH}TruckTare`)}
              name="truckTare"
              type="number"
              error={errors.truckTare}
              value={values.truckTare}
              onChange={handleChange}
            />
          </Layouts.Cell>
          <Layouts.Cell width={1}>
            <FormInput
              label={t(`${I18N_PATH}CanTare`)}
              name="canTare"
              type="number"
              error={errors.canTare}
              value={values.canTare}
              onChange={handleChange}
            />
          </Layouts.Cell>
        </>
      ) : (
        <Layouts.Cell width={1} left={5}>
          <FormInput
            label={t(`${I18N_PATH}WeightOut`)}
            name="weightOut"
            type="number"
            error={errors.weightOut}
            value={values.weightOut}
            onChange={handleChange}
          />
        </Layouts.Cell>
      )}
    </Layouts.Grid>
  );
};
