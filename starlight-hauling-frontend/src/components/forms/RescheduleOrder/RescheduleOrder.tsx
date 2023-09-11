import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Checkbox, Layouts } from '@starlightpro/shared-components';
import { useFormik } from 'formik';

import { FormInput, Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
// don't use import from @root/components/index.ts to avoid circular dependency
import OrderTimePicker from '@root/components/OrderTimePicker/OrderTimePicker';
import { useDateIntl } from '@root/helpers/format/date';
import { useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { FormContainerLayout } from '../layout/FormContainer';
import { type IForm } from '../types';

import { getValidationSchema, getValues } from './formikData';
import { type IRescheduleOrderData } from './types';

const I18N_PATH = `components.forms.RescheduleOrder.Text.`;

const RescheduleOrder: React.FC<IForm<IRescheduleOrderData>> = ({ onSubmit, onClose }) => {
  const { orderStore } = useStores();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const selectedOrder = orderStore.selectedEntity;

  const deferredUntil = selectedOrder?.payments?.find(
    payment => payment.deferredUntil,
  )?.deferredUntil;

  const formik = useFormik({
    validationSchema: getValidationSchema(deferredUntil),
    initialValues: getValues(selectedOrder!),
    initialErrors: {},
    validateOnChange: false,
    onSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, setFieldValue } = formik;
  const { dateFormat } = useDateIntl();

  useEffect(() => {
    if (selectedOrder?.deferred) {
      orderStore.requestById(selectedOrder.id, false, true);
    }
  }, [selectedOrder?.id, selectedOrder?.deferred, setFieldValue, orderStore]);

  return (
    <FormContainerLayout formik={formik} noValidate>
      <Layouts.Flex direction="column">
        <Layouts.Padding top="3" right="5" left="5">
          <Typography variant="headerThree">
            {t(`${I18N_PATH}RescheduleOrderParam`, { selectedOrderId: selectedOrder?.id })}
          </Typography>
        </Layouts.Padding>
        <Layouts.Flex direction="column" flexGrow={1}>
          <Layouts.Padding left="5" right="5" top="3">
            <Layouts.Flex>
              <Layouts.Column>
                <Calendar
                  name="oldServiceDate"
                  label={t(`${I18N_PATH}CurrentDate`)}
                  withInput
                  value={values.oldServiceDate}
                  placeholder={t('Text.SetDate')}
                  firstDayOfWeek={firstDayOfWeek}
                  dateFormat={dateFormat}
                  onDateChange={setFieldValue}
                  error={errors.oldServiceDate}
                  readOnly
                />
              </Layouts.Column>
              <Layouts.Column>
                <Calendar
                  name="serviceDate"
                  label={t(`${I18N_PATH}NewDate`)}
                  withInput
                  placeholder={t('Text.SetDate')}
                  firstDayOfWeek={firstDayOfWeek}
                  dateFormat={dateFormat}
                  onDateChange={setFieldValue}
                  error={errors.serviceDate}
                />
              </Layouts.Column>
            </Layouts.Flex>
            <OrderTimePicker />
            <FormInput
              label={t(`${I18N_PATH}Comment`)}
              placeholder={t(`${I18N_PATH}Comment_Placeholder`)}
              name="comment"
              value={values.comment ?? ''}
              error={errors.comment}
              onChange={handleChange}
              area
            />
            <Checkbox name="addTripCharge" onChange={handleChange} value={values.addTripCharge}>
              {t(`${I18N_PATH}AddTripCharge`)}
            </Checkbox>
          </Layouts.Padding>
        </Layouts.Flex>
        <Divider />
        <Layouts.Padding padding="4" left="5" right="5">
          <Layouts.Flex justifyContent="space-between">
            <Button type="reset">{t('Text.Cancel')}</Button>
            <Button type="submit" variant="primary">
              {t(`${I18N_PATH}RescheduleOrder`)}
            </Button>
          </Layouts.Flex>
        </Layouts.Padding>
      </Layouts.Flex>
    </FormContainerLayout>
  );
};

export default RescheduleOrder;
