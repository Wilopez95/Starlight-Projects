import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, Layouts, Select } from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';

import { FormInput, Typography } from '@root/common';
import { billingCyclesOptions } from '@root/consts';
import {
  aprTypeOptions,
  invoiceConstructionOptions,
  paymentTermsOptions,
} from '@root/consts/customer';
import { normalizeOptions } from '@root/helpers';
import { usePermission } from '@root/hooks';

import { INewCustomerData } from '../../types';

const I18N_PATH = 'pages.CustomerSubscriptionDetails.components.Summary.Summary.Text.';

const PaymentsAndBilling: React.FC = () => {
  const { values, errors, handleChange, setFieldValue, setFieldError } =
    useFormikContext<INewCustomerData>();
  const { t } = useTranslation();

  const canSetCreditLimit = usePermission('customers:set-credit-limit:perform');

  const handleAprChange = useCallback(
    (name: string, value: string) => {
      setFieldValue('', null);
      setFieldValue(name, value);

      setFieldError('financeCharge', undefined);
    },
    [setFieldError, setFieldValue],
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const field = e.target?.name ?? '';

      if (field === 'onAccount') {
        setFieldError('creditLimit', undefined);
        setFieldValue('creditLimit', undefined);
      } else {
        setFieldError('financeCharge', undefined);
        setFieldValue('aprType', aprTypeOptions[0]);
      }
      handleChange(e);
    },
    [handleChange, setFieldError, setFieldValue],
  );

  return (
    <Layouts.Flex flexGrow={1} direction="column">
      <Layouts.Padding left="5" right="5">
        <Layouts.Padding top="3" bottom="1">
          <Typography variant="headerThree">Invoice</Typography>
        </Layouts.Padding>
        <Layouts.Flex>
          <Layouts.Column>
            <Select
              label="Invoice construction*"
              name="invoiceConstruction"
              options={invoiceConstructionOptions}
              value={values.invoiceConstruction}
              error={errors.invoiceConstruction}
              onSelectChange={setFieldValue}
            />
          </Layouts.Column>
          <Layouts.Column>
            <Layouts.Padding top="1" bottom="1">
              <Typography color="secondary" shade="desaturated" variant="bodyMedium">
                Send Invoices and Statements by*
              </Typography>
            </Layouts.Padding>
            <Layouts.Flex>
              <Layouts.Box height="40px">
                <Layouts.Margin right="3">
                  <Checkbox
                    id="sendInvoicesByEmail"
                    name="sendInvoicesByEmail"
                    value={values.sendInvoicesByEmail}
                    error={errors.sendInvoicesByEmail}
                    onChange={handleCheckboxChange}
                  >
                    Email
                  </Checkbox>
                </Layouts.Margin>
              </Layouts.Box>
              <Layouts.Box height="40px">
                <Layouts.Margin right="3">
                  <Checkbox
                    id="sendInvoicesByPost"
                    name="sendInvoicesByPost"
                    value={values.sendInvoicesByPost}
                    error={errors.sendInvoicesByPost}
                    onChange={handleCheckboxChange}
                  >
                    {t(`${I18N_PATH}Mail`)}
                  </Checkbox>
                </Layouts.Margin>
              </Layouts.Box>
            </Layouts.Flex>
          </Layouts.Column>
        </Layouts.Flex>
        <Layouts.Padding top="3" bottom="1">
          <Typography variant="headerThree">Payment</Typography>
        </Layouts.Padding>
        <Layouts.Flex>
          <Layouts.Column>
            <Select
              label={`${t(`${I18N_PATH}DefaultBillingCycle`)}*`}
              name="billingCycle"
              options={normalizeOptions(billingCyclesOptions)}
              error={errors.billingCycle}
              value={values.billingCycle}
              onSelectChange={setFieldValue}
            />
          </Layouts.Column>
          <Layouts.Column />
        </Layouts.Flex>
        <Layouts.Box height="40px" width="175px">
          <Checkbox
            id="onAccount"
            name="onAccount"
            value={values.onAccount}
            error={errors.onAccount}
            onChange={handleCheckboxChange}
          >
            On Account
          </Checkbox>
        </Layouts.Box>
        <Layouts.Flex>
          <Layouts.Column>
            <Layouts.Flex>
              <Layouts.Margin right="1">
                <FormInput
                  label="Credit limit"
                  readOnly={!values.onAccount}
                  name="creditLimit"
                  value={values.creditLimit}
                  error={errors.creditLimit}
                  onChange={handleChange}
                  disabled={!canSetCreditLimit}
                />
              </Layouts.Margin>
              <Select
                label="Payment terms"
                name="paymentTerms"
                disabled={!values.onAccount}
                options={paymentTermsOptions}
                error={errors.paymentTerms}
                value={values.paymentTerms}
                onSelectChange={setFieldValue}
              />
            </Layouts.Flex>
          </Layouts.Column>
        </Layouts.Flex>
        <Layouts.Box height="40px" width="175px">
          <Checkbox
            id="addFinanceCharges"
            name="addFinanceCharges"
            value={values.addFinanceCharges}
            error={errors.addFinanceCharges}
            onChange={handleCheckboxChange}
          >
            Add finance charges
          </Checkbox>
        </Layouts.Box>
        <Layouts.Flex>
          {values.addFinanceCharges ? (
            <>
              <Layouts.Column>
                <Layouts.Flex>
                  <Layouts.Column>
                    <Select
                      label="APR*"
                      name="aprType"
                      disabled={!values.addFinanceCharges}
                      options={normalizeOptions(aprTypeOptions)}
                      error={errors.aprType}
                      value={values.aprType}
                      onSelectChange={handleAprChange}
                    />
                  </Layouts.Column>
                  <Layouts.Column>
                    {values.aprType === 'custom' ? (
                      <FormInput
                        label="Charge %*"
                        name="financeCharge"
                        readOnly={!values.addFinanceCharges}
                        value={values.financeCharge ?? ''}
                        error={errors.financeCharge}
                        onChange={handleChange}
                      />
                    ) : null}
                  </Layouts.Column>
                </Layouts.Flex>
              </Layouts.Column>
              <Layouts.Column />
            </>
          ) : null}
        </Layouts.Flex>
      </Layouts.Padding>
    </Layouts.Flex>
  );
};

export default PaymentsAndBilling;
