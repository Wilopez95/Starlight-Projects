import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  MultiSelect,
  Select,
} from '@starlightpro/shared-components';
import { useFormikContext } from 'formik';
import { observer } from 'mobx-react-lite';

import { CustomerService } from '@root/api';
import { Typography } from '@root/common';
import { billingCyclesOptions, CustomerStatus } from '@root/consts';
import { useDateIntl } from '@root/helpers/format/date';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { FormikRunInvoicing, InvoiceTargetEnum } from './types';

const I18N_PATH = 'pages.Invoices.RunInvoicingMenu.';

const FormSection: React.FC = () => {
  const { t } = useTranslation();
  const { dateFormat, formatDate } = useDateIntl();
  const { firstDayOfWeek } = useIntl();
  const { customerGroupStore, businessUnitStore } = useStores();
  const [customerOptions, setCustomerOptions] = useState<ISelectOption[]>([]);
  const customerService = useRef(new CustomerService());
  const { businessUnitId } = useBusinessContext();
  const businessUnit = businessUnitStore.getById(businessUnitId);
  const invoiceTargetOptions = useMemo(
    () => [
      { value: InvoiceTargetEnum.all, label: t(`${I18N_PATH}AllCustomers`) },
      { value: InvoiceTargetEnum.specific, label: t(`${I18N_PATH}BySpecificCustomer`) },
    ],
    [t],
  );

  const { handleChange, setValues, setFieldValue, values, errors } =
    useFormikContext<FormikRunInvoicing>();

  useEffect(() => {
    (async () => {
      const invoicingCustomers = await customerService.current.requestForInvoicingSubscriptions({
        businessUnitId,
      });
      setCustomerOptions(
        invoicingCustomers.map(customer => ({
          value: customer.id,
          label: customer.name,
          ...(customer.status !== CustomerStatus.active && {
            badge: {
              text: t(`Text.${customer.status === CustomerStatus.onHold ? 'OnHold' : 'Inactive'}`),
              borderRadius: 2,
              color: 'alert',
            },
          }),
        })),
      );
    })();
  }, [businessUnitId, t]);

  const activeLinesOfBusinessOptions = useMemo<ISelectOption[]>(
    () =>
      businessUnit
        ? businessUnit.businessLines.map(item => ({
            value: +item.id,
            label: item.name,
          }))
        : [],
    [businessUnit],
  );

  const customerGroupOptions = useMemo(
    () => [
      { value: 0, label: t(`${I18N_PATH}AllCustomerGroups`) },
      ...customerGroupStore.values.map(group => ({ value: group.id, label: group.description })),
    ],
    [customerGroupStore, t],
  );

  const handleInvoiceTargetChange = useCallback(
    (name: string, value: string) => {
      if (value === InvoiceTargetEnum.all) {
        setValues({
          ...values,
          customerId: undefined,
          prepaid: true,
          onAccount: true,
        });
      } else {
        setValues({
          ...values,
          prepaid: undefined,
          onAccount: undefined,
        });
      }

      setFieldValue(name, value);
    },
    [setFieldValue, setValues, values],
  );

  return (
    <>
      <MultiSelect
        label={t(`${I18N_PATH}LineOfBusiness`)}
        name="businessLineIds"
        options={activeLinesOfBusinessOptions}
        value={values.businessLineIds}
        onSelectChange={setFieldValue}
      />
      <Calendar
        label={t(`${I18N_PATH}BillingDate`)}
        name="billingDate"
        withInput
        value={values.billingDate}
        onDateChange={setFieldValue}
        error={errors.billingDate}
        firstDayOfWeek={firstDayOfWeek}
        dateFormat={dateFormat}
        formatDate={formatDate}
      />

      <Select
        label={t(`${I18N_PATH}Invoice`)}
        name="invoiceTarget"
        options={invoiceTargetOptions}
        value={values.invoiceTarget}
        onSelectChange={handleInvoiceTargetChange}
        nonClearable
      />
      {values.invoiceTarget === InvoiceTargetEnum.all ? (
        <Select
          label={t(`${I18N_PATH}CustomerGroup`)}
          name="customerGroupId"
          options={customerGroupOptions}
          value={values.customerGroupId}
          onSelectChange={setFieldValue}
          nonClearable
          error={errors.customerGroupId}
        />
      ) : null}
      {values.invoiceTarget === InvoiceTargetEnum.specific ? (
        <>
          <Typography as="label" shade="desaturated" color="secondary" htmlFor="customerId">
            {t(`${I18N_PATH}Customer`)}
          </Typography>
          <Select
            name="customerId"
            options={customerOptions}
            value={values.customerId}
            onSelectChange={setFieldValue}
            nonClearable
            error={errors.customerId}
          />
        </>
      ) : null}
      <Layouts.Margin bottom="1">
        <Typography as="label" shade="desaturated" color="secondary">
          {t(`${I18N_PATH}BillingType`)}
        </Typography>
      </Layouts.Margin>
      <Layouts.Flex>
        <Layouts.Flex>
          <Layouts.Margin right="1">
            <Checkbox name="arrears" value={values.arrears} onChange={handleChange} />
          </Layouts.Margin>
          <Layouts.Margin right="2">
            <Typography as="label" shade="desaturated" color="secondary">
              {t(`${I18N_PATH}Arrears`)}
            </Typography>
          </Layouts.Margin>
        </Layouts.Flex>
        <Layouts.Flex>
          <Layouts.Margin right="1">
            <Checkbox name="inAdvance" value={values.inAdvance} onChange={handleChange} />
          </Layouts.Margin>
          <Typography as="label" shade="desaturated" color="secondary">
            {t(`${I18N_PATH}InAdvance`)}
          </Typography>
        </Layouts.Flex>
      </Layouts.Flex>
      {values.invoiceTarget === InvoiceTargetEnum.all ? (
        <>
          <Layouts.Margin
            bottom="1"
            top={values.invoiceTarget === InvoiceTargetEnum.all ? '3' : '0'}
          >
            <Typography as="label" shade="desaturated" color="secondary">
              {t(`${I18N_PATH}CustomerType`)}
            </Typography>
          </Layouts.Margin>
          <Layouts.Flex>
            <Layouts.Flex>
              <Layouts.Margin right="1">
                <Checkbox name="prepaid" value={values.prepaid} onChange={handleChange} />
              </Layouts.Margin>
              <Layouts.Margin right="2">
                <Typography as="label" shade="desaturated" color="secondary">
                  {t(`${I18N_PATH}Prepaid`)}
                </Typography>
              </Layouts.Margin>
            </Layouts.Flex>
            <Layouts.Flex>
              <Layouts.Margin right="1">
                <Checkbox name="onAccount" value={values.onAccount} onChange={handleChange} />
              </Layouts.Margin>
              <Typography as="label" shade="desaturated" color="secondary">
                {t(`${I18N_PATH}OnAccount`)}
              </Typography>
            </Layouts.Flex>
          </Layouts.Flex>
        </>
      ) : null}
      <Layouts.Margin top="3">
        <MultiSelect
          name="billingCycles"
          label={t(`${I18N_PATH}BillingCycle`)}
          options={billingCyclesOptions}
          value={values.billingCycles as string[]}
          onSelectChange={setFieldValue}
        />
      </Layouts.Margin>
    </>
  );
};

export default observer(FormSection);
