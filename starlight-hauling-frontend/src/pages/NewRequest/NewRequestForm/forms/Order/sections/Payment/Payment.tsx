import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  Select,
} from '@starlightpro/shared-components';
import { FieldArray, getIn, useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';
import validator from 'validator';

import { DeleteIcon } from '@root/assets';
import { FormInput, Protected, Section, Subsection, Typography } from '@root/common';
import { ClientRequestType, CustomerStatus } from '@root/consts';
import { formatCreditCard, handleEnterOrSpaceKeyDown } from '@root/helpers';
import { useDateIntl } from '@root/helpers/format/date';
import { usePermission, usePrevious, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CreditCard } from '@root/modules/billing/CreditCards/components';
import { type PaymentMethod } from '@root/modules/billing/types';

import { getOrdersTotal, isDeferredPaymentAllowed } from '../../helpers';
import { INewOrders, IOrderPayment } from '../../types';

const prepaidPaymentOptions: ISelectOption[] = [
  {
    label: 'Credit Card',
    value: 'creditCard',
  },
  { label: 'Cash', value: 'cash' },
  { label: 'Check', value: 'check' },
];

const onAccountPaymentOption: ISelectOption[] = [
  {
    label: 'On Account',
    value: 'onAccount',
  },
];

const orderRequestPaymentOptions: ISelectOption[] = [
  {
    label: 'On Account',
    value: 'onAccount',
  },
  {
    label: 'Credit Card',
    value: 'creditCard',
  },
];

const defaultPaymentValue: IOrderPayment = {
  paymentMethod: 'cash',
  amount: '0.00',
  sendReceipt: false,
  authorizeCard: false,
  isAch: false,
};

const PaymentSection: React.FC = () => {
  const { values, errors, setFieldValue, setFieldError, handleChange } =
    useFormikContext<INewOrders>();
  const { creditCardStore, customerStore, jobSiteStore, surchargeStore, i18nStore } = useStores();
  const { t } = useTranslation();
  const { firstDayOfWeek } = useIntl();

  const selectedJobSite = jobSiteStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  const availableCredit = selectedCustomer?.balances?.availableCredit ?? 0;

  const notDeferredPayments = values.payments.filter(
    ({ paymentMethod, deferredPayment }) => paymentMethod === 'creditCard' && !deferredPayment,
  );

  const orderTotals = useMemo(
    () =>
      getOrdersTotal({
        orders: values.orders,
        businessLineId: values.businessLineId,
        region: i18nStore.region,
        taxDistricts: values.taxDistricts,
        surcharges: surchargeStore.values,
        commercialTaxesUsed: values.commercialTaxesUsed,
      }),
    [
      i18nStore.region,
      surchargeStore.values,
      values.businessLineId,
      values.orders,
      values.taxDistricts,
      values.commercialTaxesUsed,
    ],
  );

  const prevOrderTotals = usePrevious(orderTotals);

  const onAccountPayment = useMemo(
    () => values.payments.find(payment => payment.paymentMethod === 'onAccount'),
    [values.payments],
  );

  const canPlaceOnAccountForOnHold = usePermission('orders:new-on-account-on-hold-order:perform');
  const canPlacePrepaidForOnHold = usePermission('orders:new-prepaid-on-hold-order:perform');

  useEffect(() => {
    if (prevOrderTotals !== orderTotals && orderTotals === 0) {
      setFieldValue('payments', [
        {
          paymentMethod: 'onAccount',
          amount: 0,
          sendReceipt: false,
          authorizeCard: false,
        },
      ]);

      return;
    }

    if (
      prevOrderTotals !== orderTotals &&
      values.payments.length === 1 &&
      values.type !== ClientRequestType.OrderRequest
    ) {
      const isOnAccountPayment =
        (orderTotals <= availableCredit || selectedCustomer?.onAccount) &&
        (selectedCustomer?.status !== CustomerStatus.onHold || canPlaceOnAccountForOnHold);

      if (
        selectedCustomer?.status === CustomerStatus.onHold &&
        !isOnAccountPayment &&
        !canPlacePrepaidForOnHold
      ) {
        setFieldValue('payments', []);

        return;
      }

      setFieldValue('payments', [
        {
          paymentMethod: isOnAccountPayment ? 'onAccount' : 'creditCard',
          amount: orderTotals.toFixed(2),
          sendReceipt: false,
          authorizeCard: !isOnAccountPayment,
        },
      ]);
    }
  }, [
    availableCredit,
    selectedCustomer,
    orderTotals,
    setFieldValue,
    values.payments.length,
    prevOrderTotals,
    values.type,
    canPlaceOnAccountForOnHold,
    canPlacePrepaidForOnHold,
  ]);

  useEffect(() => {
    if (orderTotals !== prevOrderTotals && orderTotals > 0) {
      setFieldError('payments[0].amount', undefined);
    }
  }, [orderTotals, prevOrderTotals, setFieldError]);

  const handleDeferredChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const checked = e.target.checked;

      const payments = [...values.payments];

      payments.forEach(payment => {
        payment.deferredPayment = false;
      });

      payments[index].deferredPayment = checked;

      if (checked && payments[index].authorizeCard) {
        payments[index].authorizeCard = false;

        const nextAuthorizedIndex = payments.findIndex(
          (payment, i) =>
            payment.paymentMethod === 'creditCard' && index !== i && !payment.deferredPayment,
        );

        if (nextAuthorizedIndex > -1) {
          payments[nextAuthorizedIndex].authorizeCard = true;
        }
      }

      setFieldValue('payments', payments);
    },
    [setFieldValue, values.payments],
  );

  const handleAuthorizeCardChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const checked = e.target.checked;

      const payments = [...values.payments];

      // radio button like behavior
      if (!checked) {
        return;
      }

      payments.forEach(payment => {
        payment.authorizeCard = false;
      });

      payments[index].authorizeCard = true;
      payments[index].deferredPayment = false;

      setFieldValue('payments', payments);
    },
    [setFieldValue, values.payments],
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

  const creditCardOptions: ISelectOption[] = creditCardStore.values
    .filter(creditCard => !creditCard.expiredLabel)
    .map(creditCard => ({
      label: formatCreditCard(creditCard),
      value: creditCard.id,
    }));

  creditCardOptions.unshift({
    label: 'New Credit Card',
    value: 0,
  });

  useEffect(() => {
    if (selectedJobSite?.id && selectedCustomer?.id) {
      creditCardStore.requestRelevant({
        customerId: selectedCustomer.id,
        jobSiteId: selectedJobSite.id,
      });
    }
  }, [creditCardStore, selectedJobSite?.id, selectedCustomer?.id]);

  const handlePaymentMethodChange = useCallback(
    (value: PaymentMethod | undefined, index: number) => {
      const payments = [...values.payments];

      const newPayment: IOrderPayment = {
        paymentMethod: value,
        amount: validator.isNumeric(payments[index].amount.toString()) ? payments[index].amount : 0,
        sendReceipt: false,
        authorizeCard: false,
        deferredPayment: false,
        isAch: false,
      };

      if (notDeferredPayments.length === 0 && value === 'creditCard') {
        newPayment.authorizeCard = true;
      }

      payments[index] = newPayment;

      setFieldValue('payments', payments);
    },
    [notDeferredPayments.length, setFieldValue, values.payments],
  );

  const handlePaymentMethodRemove = useCallback(
    (index: number) => {
      const paymentToRemove = values.payments[index];

      const payments = values.payments.filter((_, i) => i !== index);

      if (paymentToRemove.authorizeCard) {
        const nextAuthorizedIndex = payments.findIndex(
          ({ paymentMethod, deferredPayment }) =>
            paymentMethod === 'creditCard' && !deferredPayment,
        );

        if (nextAuthorizedIndex > -1) {
          payments[nextAuthorizedIndex].authorizeCard = true;
        }
      }

      setFieldValue('payments', payments);
    },
    [setFieldValue, values.payments],
  );

  const paymentsLength = values.payments.length;

  const isThirdPartyHauler = useMemo(
    () => values.orders.some(({ thirdPartyHaulerId }) => thirdPartyHaulerId),
    [values.orders],
  );

  const onAccountAvailable =
    (availableCredit >= orderTotals || selectedCustomer?.onAccount) && !onAccountPayment;

  const paymentOptions = useCallback(
    (payment: IOrderPayment) => {
      if (orderTotals === 0) {
        return onAccountPaymentOption;
      }

      if (values.type === ClientRequestType.OrderRequest) {
        return orderRequestPaymentOptions;
      }

      const canPlaceOnAccount =
        (payment.paymentMethod === 'onAccount' || onAccountAvailable) &&
        (selectedCustomer?.status !== CustomerStatus.onHold || canPlaceOnAccountForOnHold);
      const canPlacePrepaid =
        selectedCustomer?.status !== CustomerStatus.onHold || canPlacePrepaidForOnHold;

      if (canPlaceOnAccount && canPlacePrepaid) {
        return prepaidPaymentOptions.concat(onAccountPaymentOption);
      } else if (canPlaceOnAccount) {
        return onAccountPaymentOption;
      } else if (canPlacePrepaid) {
        return prepaidPaymentOptions;
      } else {
        return [];
      }
    },
    [
      canPlaceOnAccountForOnHold,
      canPlacePrepaidForOnHold,
      onAccountAvailable,
      orderTotals,
      selectedCustomer?.status,
      values.type,
    ],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLOrSVGElement>,
    callback: (i: number) => void,
    index: number,
  ) => {
    if (handleEnterOrSpaceKeyDown(e)) {
      callback(index);
    }
  };

  const canOnlyUseOnAccount =
    selectedCustomer?.status === CustomerStatus.onHold &&
    canPlaceOnAccountForOnHold &&
    !canPlacePrepaidForOnHold;

  const { dateFormat } = useDateIntl();

  return (
    <Section>
      <FieldArray name="payments">
        {({ push }) =>
          values.payments.map((payment, index) => (
            <React.Fragment key={index}>
              <Subsection gray>
                <Layouts.Margin bottom="1">
                  <Layouts.Flex justifyContent="space-between">
                    <Typography variant="headerThree">
                      Payment {paymentsLength > 1 ? `#${index + 1}` : ''}
                    </Typography>
                    {paymentsLength > 1 ? (
                      <Layouts.Flex
                        alignItems="center"
                        onClick={() => handlePaymentMethodRemove(index)}
                      >
                        <Layouts.IconLayout remove>
                          <DeleteIcon
                            role="button"
                            aria-label={t('Text.Remove')}
                            tabIndex={0}
                            onKeyDown={e => handleKeyDown(e, handlePaymentMethodRemove, index)}
                          />
                        </Layouts.IconLayout>
                        <Typography
                          variant="bodyMedium"
                          cursor="pointer"
                          color="information"
                          as="span"
                        >
                          Remove
                        </Typography>
                      </Layouts.Flex>
                    ) : null}
                  </Layouts.Flex>
                </Layouts.Margin>
                <Layouts.Flex>
                  <Layouts.Column>
                    <Select
                      label={orderTotals === 0 ? 'Payment method' : 'Payment method*'}
                      name={`payments[${index}].paymentMethod`}
                      options={paymentOptions(payment)}
                      value={payment.paymentMethod}
                      onSelectChange={(_, value) =>
                        handlePaymentMethodChange(value as PaymentMethod | undefined, index)
                      }
                      error={getIn(errors, `payments[${index}].paymentMethod`)}
                    />
                    {payment.paymentMethod === 'creditCard' ? (
                      <Select
                        nonClearable
                        label="Credit Card*"
                        placeholder="Credit card"
                        name={`payments[${index}].creditCardId`}
                        options={creditCardOptions}
                        value={payment.creditCardId}
                        onSelectChange={(name, value) =>
                          handleCreditCardChange(name, value as number, index)
                        }
                        error={getIn(errors, `payments[${index}].creditCardId`)}
                      />
                    ) : null}
                    {payment.paymentMethod === 'check' ? (
                      <FormInput
                        label="Check#*"
                        placeholder="Enter check number"
                        name={`payments[${index}].checkNumber`}
                        value={payment.checkNumber}
                        error={getIn(errors, `payments[${index}].checkNumber`)}
                        onChange={handleChange}
                      />
                    ) : null}
                  </Layouts.Column>
                  <Layouts.Column>
                    <FormInput
                      label="Amount, $*"
                      type="number"
                      placeholder="Enter payment amount"
                      name={`payments[${index}].amount`}
                      value={payment.amount}
                      error={getIn(errors, `payments[${index}].amount`)}
                      onChange={handleChange}
                    />
                    {payment.deferredPayment ? (
                      <Layouts.Box position="relative">
                        <Calendar
                          label="Deferred until*"
                          name={`payments[${index}].deferredUntil`}
                          withInput
                          value={payment.deferredUntil}
                          placeholder={t('Text.SetDate')}
                          firstDayOfWeek={firstDayOfWeek}
                          dateFormat={dateFormat}
                          error={getIn(errors, `payments[${index}].deferredUntil`)}
                          onDateChange={setFieldValue}
                        />
                      </Layouts.Box>
                    ) : null}
                  </Layouts.Column>
                </Layouts.Flex>
                <Layouts.Flex>
                  {payment.paymentMethod === 'check' ? (
                    <Checkbox
                      name={`payments[${index}].isAch`}
                      value={payment.isAch}
                      onChange={handleChange}
                    >
                      Is ACH
                    </Checkbox>
                  ) : null}
                  {payment.paymentMethod &&
                  payment.paymentMethod !== 'onAccount' &&
                  !selectedCustomer?.onAccount ? (
                    <Checkbox
                      id={`payments[${index}].sendReceipt`}
                      name={`payments[${index}].sendReceipt`}
                      value={payment.sendReceipt}
                      onChange={handleChange}
                    >
                      Send receipt
                    </Checkbox>
                  ) : null}
                  {isDeferredPaymentAllowed(values, payment) && !isThirdPartyHauler ? (
                    <Protected permissions="billing:deferred-payments:full-access">
                      <Layouts.Margin left="2">
                        <Checkbox
                          id={`payments[${index}].deferredPayment`}
                          name={`payments[${index}].deferredPayment`}
                          value={payment.deferredPayment}
                          onChange={e => handleDeferredChange(e, index)}
                        >
                          Deferred Payment
                        </Checkbox>
                      </Layouts.Margin>
                    </Protected>
                  ) : null}
                  {payment.paymentMethod === 'creditCard' ? (
                    <Layouts.Margin left="2">
                      <Checkbox
                        id={`payments[${index}].authorizeCard`}
                        name={`payments[${index}].authorizeCard`}
                        value={payment.authorizeCard}
                        onChange={e => handleAuthorizeCardChange(e, index)}
                        disabled={
                          values.payments.filter(
                            ({ paymentMethod }) => paymentMethod === 'creditCard',
                          ).length === 1
                        }
                      >
                        Authorize from this card
                      </Checkbox>
                    </Layouts.Margin>
                  ) : null}
                </Layouts.Flex>
                {index === paymentsLength - 1 &&
                paymentsLength < 3 &&
                !canOnlyUseOnAccount &&
                orderTotals !== 0 ? (
                  <Layouts.Margin top="2">
                    <Typography
                      tabIndex={0}
                      variant="bodyMedium"
                      color="information"
                      cursor="pointer"
                      role="button"
                      onClick={() => push(defaultPaymentValue)}
                      onKeyDown={e => {
                        if (handleEnterOrSpaceKeyDown(e)) {
                          push(defaultPaymentValue);
                        }
                      }}
                    >
                      + Add Payment Method
                    </Typography>
                  </Layouts.Margin>
                ) : null}
              </Subsection>
              {payment.creditCardId === 0 ? (
                <Subsection>
                  <CreditCard activeByDefault isNew basePath={`payments[${index}].newCreditCard`} />
                </Subsection>
              ) : null}
            </React.Fragment>
          ))
        }
      </FieldArray>
    </Section>
  );
};

export default observer(PaymentSection);
