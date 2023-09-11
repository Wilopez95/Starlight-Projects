import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  Select,
  TextInput,
} from '@starlightpro/shared-components';
import { getIn, useFormikContext } from 'formik';
import { uniqBy } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { FormInput, Subsection } from '@root/common';
import { RefundWrongCCModal } from '@root/components/modals';
import { formatCreditCard, normalizeOptions } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { useBoolean, useCleanup, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CreditCard } from '@root/modules/billing/CreditCards/components';
import { PaymentType } from '@root/modules/billing/types';
import { IConfigurableOrder } from '@root/types';

import { checkDeferredPaymentAllowed } from '../../helpers';

const deferredPaymentMethodOptions = normalizeOptions(['creditCard', 'cash', 'check']);

const PaymentSection = () => {
  const [isOpenRefundCCModal, setOpenRefundCCModal, closeOpenRefundCCModal] = useBoolean();
  const [paymentData, setPaymentData] = useState<{
    paymentId: number;
    amount: number;
    creditCardLabel: string;
  }>();

  const { creditCardStore, orderStore } = useStores();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const { values, setFieldValue, handleChange, errors } = useFormikContext<IConfigurableOrder>();

  const { customerId } = values;

  const isDeferredPaymentAllowed = checkDeferredPaymentAllowed(values);

  useCleanup(creditCardStore);

  const selectedOrder = orderStore.selectedEntity;

  useEffect(() => {
    creditCardStore.requestRelevant({
      customerId: values.customerId,
      jobSiteId: values.jobSiteId,
    });
  }, [creditCardStore, values.customerId, values.jobSiteId]);

  const creditCardOptions: ISelectOption[] = uniqBy(
    creditCardStore.values
      .map(creditCard => ({
        label: formatCreditCard(creditCard),
        value: creditCard.id,
      }))
      .concat(
        selectedOrder?.payments
          ?.filter(
            ({ status, deferredUntil, creditCard }) =>
              deferredUntil && creditCard && (status === 'deferred' || status === 'failed'),
          )
          .map(payment => ({
            // '!' because of filter statement used before
            label: formatCreditCard(payment.creditCard!),
            value: payment.creditCardId!,
          })) ?? [],
      ),
    ({ value }) => Number(value),
  );

  creditCardOptions.unshift({
    label: 'New Credit Card',
    value: 0,
  });

  const handleRefundWrongCc = useCallback(
    (index: number) => {
      const payment = values.payments[index];

      if (payment?.paymentType === 'creditCard' && payment.creditCard) {
        setPaymentData({
          paymentId: payment.paymentId,
          amount: payment.amount,
          creditCardLabel: formatCreditCard(payment.creditCard),
        });

        setOpenRefundCCModal();
      }
    },
    [setOpenRefundCCModal, values.payments],
  );

  const handlePaymentTypeChange = useCallback(
    (name: string, value: PaymentType, index: number) => {
      setFieldValue(name, value);

      // little hack because of discriminated union
      setFieldValue(`payments[${index}].newCreditCard`, undefined);
    },
    [setFieldValue],
  );

  const handleCreditCardChange = useCallback(
    (name: string, value: number, index: number) => {
      setFieldValue(name, value);

      if (value === 0) {
        setFieldValue(`payments[${index}].newCreditCard.active`, true);
      } else {
        setFieldValue(`payments[${index}].newCreditCard`, undefined);
      }
    },
    [setFieldValue],
  );

  const { dateFormat } = useDateIntl();

  return (
    <>
      {paymentData ? (
        <RefundWrongCCModal
          isOpen={isOpenRefundCCModal}
          onClose={closeOpenRefundCCModal}
          creditCardLabel={paymentData.creditCardLabel}
          amount={paymentData.amount}
          paymentId={paymentData.paymentId}
          orderId={values.id}
          customerId={customerId}
        />
      ) : null}
      {values.payments.map((payment, index) => {
        const isDeferred =
          (payment.status === 'deferred' || payment.status === 'failed') && payment.deferredUntil;
        const creditCardLabel = payment?.creditCard ? formatCreditCard(payment.creditCard) : '';
        const originalPayment = selectedOrder?.payments?.find(p => p.id === payment.paymentId);
        const isDeferredUntilVisible =
          isDeferredPaymentAllowed &&
          isDeferred &&
          (payment.status === 'deferred' ||
            (payment.status === 'failed' &&
              originalPayment?.creditCardId === payment.creditCardId));

        return (
          <React.Fragment key={index}>
            {payment.amount >= 0 ? (
              <>
                <Subsection>
                  <Layouts.Flex>
                    <Layouts.Column>
                      <Select
                        name={`payments[${index}].paymentType`}
                        disabled={!isDeferred}
                        label="Payment Method*"
                        value={payment.paymentType}
                        options={
                          isDeferred
                            ? deferredPaymentMethodOptions
                            : normalizeOptions([payment.paymentType])
                        }
                        onSelectChange={(name, value) =>
                          handlePaymentTypeChange(name, value as PaymentType, index)
                        }
                        error={getIn(errors, `payments[${index}].paymentType`)}
                      />
                      {payment.paymentType === 'creditCard' ? (
                        <Select
                          name={`payments[${index}].creditCardId`}
                          disabled={!isDeferred}
                          onSelectChange={(name, value) =>
                            handleCreditCardChange(name, value as number, index)
                          }
                          label="Credit Card*"
                          value={!isDeferred ? creditCardLabel : payment.creditCardId}
                          options={
                            isDeferred
                              ? creditCardOptions
                              : [
                                  {
                                    value: creditCardLabel,
                                    label: creditCardLabel,
                                  },
                                ]
                          }
                          error={getIn(errors, `payments[${index}].creditCardId`)}
                        />
                      ) : null}
                      {payment.paymentType === 'check' ? (
                        <FormInput
                          name={`payments[${index}].checkNumber`}
                          label="Check#*"
                          value={payment.checkNumber}
                          onChange={handleChange}
                          disabled={!isDeferred}
                          error={getIn(errors, `payments[${index}].checkNumber`)}
                        />
                      ) : null}
                    </Layouts.Column>

                    <Layouts.Column>
                      <Layouts.Flex alignItems="flex-end">
                        <Layouts.Column>
                          <TextInput
                            onChange={handleChange}
                            name="amount"
                            id={`amount ${index}`}
                            label="Amount, $"
                            value={payment.amount}
                            disabled
                          />
                          {!payment.deferredUntil && payment.paymentType === 'creditCard' ? (
                            <Layouts.Margin top="3">
                              <Button onClick={() => handleRefundWrongCc(index)}>
                                Refund wrong CC
                              </Button>
                            </Layouts.Margin>
                          ) : null}
                          {isDeferredUntilVisible ? (
                            <Layouts.Box position="relative">
                              <Calendar
                                label="Deferred until"
                                name={`payments[${index}].deferredUntil`}
                                withInput
                                value={payment.deferredUntil}
                                placeholder={t('Text.SetDate')}
                                firstDayOfWeek={firstDayOfWeek}
                                dateFormat={dateFormat}
                                onDateChange={setFieldValue}
                                readOnly={payment.status !== 'deferred'}
                                error={getIn(errors, `payments[${index}].deferredUntil`)}
                              />
                            </Layouts.Box>
                          ) : null}
                          {payment.paymentType === 'check' ? (
                            <Layouts.Margin top="4">
                              <Checkbox
                                name={`payments[${index}].isAch`}
                                value={payment.isAch}
                                disabled={!isDeferred}
                                onChange={handleChange}
                              >
                                Is ACH
                              </Checkbox>
                            </Layouts.Margin>
                          ) : null}
                        </Layouts.Column>
                      </Layouts.Flex>
                    </Layouts.Column>
                  </Layouts.Flex>
                </Subsection>
                {payment.creditCardId === 0 ? (
                  <Subsection gray>
                    <CreditCard
                      isNew
                      activeByDefault
                      basePath={`payments[${index}].newCreditCard`}
                    />
                  </Subsection>
                ) : null}
              </>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default observer(PaymentSection);
