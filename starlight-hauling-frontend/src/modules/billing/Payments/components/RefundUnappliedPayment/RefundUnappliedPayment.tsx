import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, ISelectOption, Layouts, Select } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Modal, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { FormContainerLayout } from '../../../../../components/forms/layout/FormContainer';
import { IFormModal } from '../../../../../components/modals/types';
import { formatCreditCard } from '../../../../../helpers';
import { useDateIntl } from '../../../../../helpers/format/date';
import { useStores } from '../../../../../hooks';
import { useIntl } from '../../../../../i18n/useIntl';
import { ICreditCard } from '../../../CreditCards/types';

import { getValidationSchema, getValues } from './formikData';
import { type IRefundUnappliedPaymentData } from './types';

import styles from './css/styles.scss';

const RefundUnappliedPayment: React.FC<IFormModal<IRefundUnappliedPaymentData>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  const { paymentStore, creditCardStore } = useStores();
  const { formatCurrency, formatDateTime, firstDayOfWeek } = useIntl();
  const selectedPayment = paymentStore.selectedEntity;
  const { t } = useTranslation();

  const handleRefundPaymentSubmit = useCallback(
    async (
      data: IRefundUnappliedPaymentData,
      { validateForm }: FormikHelpers<IRefundUnappliedPaymentData>,
    ) => {
      const formErrors = await validateForm();

      if (isEmpty(formErrors)) {
        onFormSubmit(data);
      }
    },
    [onFormSubmit],
  );

  const formik = useFormik({
    validationSchema: getValidationSchema(selectedPayment?.unappliedAmount ?? 0),
    initialValues: getValues(selectedPayment),
    initialErrors: {},
    validateOnChange: false,
    onSubmit: handleRefundPaymentSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, setFieldValue } = formik;

  const paymentDate = selectedPayment?.date ?? new Date();

  const paymentAmount = selectedPayment?.amount ?? 0;

  const { dateFormat } = useDateIntl();

  const creditCard = useMemo(() => {
    const paymentCard = creditCardStore.values.find(
      (cc: ICreditCard) => cc.id === Number(selectedPayment?.creditCard?.id),
    );

    return paymentCard ? formatCreditCard(paymentCard) : '';
  }, [creditCardStore.values, selectedPayment?.creditCard?.id]);

  const creditCardOptions: ISelectOption[] = selectedPayment?.creditCard?.id
    ? [
        {
          label: creditCard,
          value: selectedPayment.creditCard.id,
        },
      ]
    : [];

  const refundTypeOptions: ISelectOption[] = selectedPayment?.creditCard?.id
    ? [
        {
          label: 'Credit Card',
          value: 'creditCard',
        },
      ]
    : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      <FormContainerLayout formik={formik}>
        <Layouts.Flex direction="column">
          <Layouts.Padding top="3" right="5" left="5">
            <Typography variant="headerThree">Refund payment</Typography>
          </Layouts.Padding>
          <Layouts.Flex direction="column" flexGrow={1}>
            <Layouts.Padding left="5" right="5" top="2">
              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography color="secondary" variant="bodyMedium" shade="desaturated">
                      Original payment:
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography
                      color="secondary"
                      variant="bodyMedium"
                      shade="dark"
                      textAlign="right"
                    >
                      {creditCard}
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography color="secondary" variant="bodyMedium" shade="desaturated">
                      Payment Date:
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography
                      color="secondary"
                      variant="bodyMedium"
                      shade="dark"
                      textAlign="right"
                    >
                      {formatDateTime(paymentDate).date}
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography variant="bodyMedium">
                      <Typography fontWeight="bold" color="secondary" shade="desaturated">
                        Payment Amount:
                      </Typography>
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography color="secondary" variant="bodyMedium" shade="dark">
                      <Typography fontWeight="bold" textAlign="right">
                        {formatCurrency(paymentAmount)}
                      </Typography>
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="1" bottom="4">
                    <Typography color="secondary" variant="bodyMedium" shade="desaturated">
                      Unapplied:
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="1" bottom="4">
                    <Typography color="alert" variant="bodyMedium" shade="dark" textAlign="right">
                      {formatCurrency(selectedPayment?.unappliedAmount)}
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <Divider />

              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="3">
                    <Calendar
                      name="refundDate"
                      label="Refund Date"
                      withInput
                      value={values.refundDate}
                      placeholder={t('Text.SetDate')}
                      firstDayOfWeek={firstDayOfWeek}
                      dateFormat={dateFormat}
                      onDateChange={setFieldValue}
                      error={errors.refundDate}
                      readOnly
                    />
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="3">
                    <FormInput
                      label="Refund Amount, $"
                      type="number"
                      name="refundAmount"
                      value={values.refundAmount}
                      error={errors.refundAmount}
                      onChange={handleChange}
                      placeholder="0"
                    />
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <Layouts.Flex>
                <Select
                  label="Refund type"
                  placeholder="Select refund type"
                  name="refundType"
                  options={refundTypeOptions}
                  value={values.refundType}
                  onSelectChange={setFieldValue}
                  error={errors.refundType}
                  disabled
                />
              </Layouts.Flex>
              <Layouts.Flex>
                <Select
                  label="Credit Card"
                  placeholder="Select credit card"
                  name="creditCardId"
                  options={creditCardOptions}
                  value={values.creditCardId}
                  onSelectChange={setFieldValue}
                  error={errors.creditCardId}
                  disabled
                />
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>

          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset">Cancel</Button>
              <Button type="submit" variant="alert">
                Refund Payment
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default observer(RefundUnappliedPayment);
