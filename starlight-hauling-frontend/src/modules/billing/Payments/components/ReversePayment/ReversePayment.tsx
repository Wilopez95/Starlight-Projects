import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Layouts } from '@starlightpro/shared-components';
import { FormikHelpers, useFormik } from 'formik';
import { isEmpty } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Modal, RadioButton, Typography } from '../../../../../common';
import { Divider } from '../../../../../common/TableTools';
import { FormContainerLayout } from '../../../../../components/forms/layout/FormContainer';
import { IFormModal } from '../../../../../components/modals/types';
import { useDateIntl } from '../../../../../helpers/format/date';
import { useStores } from '../../../../../hooks';
import { useIntl } from '../../../../../i18n/useIntl';
import { ICreditCard } from '../../../CreditCards/types';

import { ReverseComment } from './css/styles';
import { getValues, validationSchema } from './formikData';
import { type IReversePaymentData } from './types';

import styles from './css/styles.scss';

const reversalTypes = {
  cash: {
    label: 'Counterfeit cash',
    value: 'counterfeitCash',
  },
  check: {
    label: 'Bounced',
    value: 'bounced',
  },
  creditCard: {
    label: 'Chargeback',
    value: 'chargeback',
  },
  creditMemo: {
    label: '',
    value: '',
  },
  writeOff: {
    label: '',
    value: '',
  },
  refundOnAccount: {
    label: '',
    value: '',
  },
};

const ReversePayment: React.FC<IFormModal<IReversePaymentData>> = ({
  isOpen,
  onClose,
  onFormSubmit,
}) => {
  const { paymentStore, creditCardStore } = useStores();
  const { formatDateTime, formatCurrency, firstDayOfWeek } = useIntl();
  const selectedPayment = paymentStore.selectedEntity;
  const { t } = useTranslation();

  const handleReversePaymentSubmit = useCallback(
    async (data: IReversePaymentData, helpers: FormikHelpers<IReversePaymentData>) => {
      const formErrors = await helpers.validateForm();

      if (isEmpty(formErrors)) {
        onFormSubmit(data);
      }
    },
    [onFormSubmit],
  );

  const formik = useFormik({
    validationSchema,
    initialValues: getValues(selectedPayment),
    initialErrors: {},
    validateOnChange: false,
    onSubmit: handleReversePaymentSubmit,
    onReset: onClose,
  });

  const { values, errors, handleChange, setFieldValue } = formik;

  const handleReversalTypeChange = useCallback(
    (value: string) => {
      setFieldValue('reversalType', value);
    },
    [setFieldValue],
  );

  const paymentDate = selectedPayment?.date ?? new Date();

  const paymentAmount = selectedPayment?.amount ?? 0;

  const paymentType = selectedPayment?.paymentType ?? 'cash';
  const mainReversalType = reversalTypes[paymentType];

  useEffect(() => {
    setFieldValue('reversalType', mainReversalType.value);
  }, [mainReversalType.value, setFieldValue]);

  const creditCardLastDigits = useMemo(
    () =>
      creditCardStore.values.find(
        (cc: ICreditCard) => cc.id === Number(selectedPayment?.creditCard?.id),
      )?.cardNumberLastDigits,
    [creditCardStore.values, selectedPayment?.creditCard?.id],
  );

  const paymentDescriptions = {
    cash: 'Cash',
    check: `#${selectedPayment?.checkNumber ?? ''}`,
    creditCard: creditCardLastDigits,
    creditMemo: '',
    writeOff: '',
  };

  const paymentDescription = paymentDescriptions[paymentType];
  const { dateFormat } = useDateIntl();

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
            <Typography variant="headerThree">Reverse payment</Typography>
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
                      {paymentDescription}
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="1">
                    <Typography color="secondary" variant="bodyMedium" shade="desaturated">
                      Date:
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
                  <Layouts.Padding top="1" bottom="4">
                    <Typography variant="bodyMedium">
                      <Typography fontWeight="bold" color="secondary" shade="desaturated">
                        Payment Amount:
                      </Typography>
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="1" bottom="4">
                    <Typography color="secondary" variant="bodyMedium" shade="dark">
                      <Typography fontWeight="bold" textAlign="right">
                        {formatCurrency(paymentAmount)}
                      </Typography>
                    </Typography>
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>

              <Divider />

              <Layouts.Flex>
                <Layouts.Column>
                  <Layouts.Padding top="3">
                    <Calendar
                      name="reversalDate"
                      label="Reversal Date*"
                      withInput
                      value={values.reversalDate}
                      placeholder={t('Text.SetDate')}
                      firstDayOfWeek={firstDayOfWeek}
                      dateFormat={dateFormat}
                      onDateChange={setFieldValue}
                      error={errors.reversalDate}
                    />
                  </Layouts.Padding>
                </Layouts.Column>
                <Layouts.Column>
                  <Layouts.Padding top="3">
                    <FormInput
                      label="Reversal Amount, $"
                      name="reversalAmount"
                      value={values.paymentAmount}
                      error={errors.paymentAmount}
                      onChange={handleChange}
                      placeholder="0"
                      disabled
                    />
                  </Layouts.Padding>
                </Layouts.Column>
              </Layouts.Flex>
              <ReverseComment>
                <FormInput
                  label="Comment"
                  name="comment"
                  value={values.comment ?? ''}
                  error={errors.comment}
                  onChange={handleChange}
                  area
                />
              </ReverseComment>

              <Layouts.Flex>
                <Layouts.Column padding="1">
                  <RadioButton
                    name="reversalType"
                    onChange={() => handleReversalTypeChange(mainReversalType.value)}
                    value={values.reversalType === mainReversalType.value}
                  >
                    {mainReversalType.label}
                  </RadioButton>
                </Layouts.Column>
                <Layouts.Column>
                  <RadioButton
                    name="reversalType"
                    onChange={() => handleReversalTypeChange('other')}
                    value={values.reversalType === 'other'}
                  >
                    Other
                  </RadioButton>
                </Layouts.Column>
              </Layouts.Flex>
            </Layouts.Padding>
          </Layouts.Flex>

          <Divider />
          <Layouts.Padding padding="4" left="5" right="5">
            <Layouts.Flex justifyContent="space-between">
              <Button type="reset">Cancel</Button>
              <Button type="submit" variant="alert">
                Reverse Payment
              </Button>
            </Layouts.Flex>
          </Layouts.Padding>
        </Layouts.Flex>
      </FormContainerLayout>
    </Modal>
  );
};

export default observer(ReversePayment);
