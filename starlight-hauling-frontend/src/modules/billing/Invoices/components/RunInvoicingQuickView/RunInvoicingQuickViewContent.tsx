import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Calendar,
  Checkbox,
  ISelectOption,
  Layouts,
  MultiSelect,
  Select,
} from '@starlightpro/shared-components';
import { useFormik, validateYupSchema } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';
import { CustomerGroupType } from '@root/types';

import { endOfDay } from 'date-fns';
import { CustomerService, IOrderInvoicingRequest, OrderService } from '../../../../../api';
import { Typography } from '../../../../../common';
import { QuickViewContent, useQuickViewContext } from '../../../../../common/QuickView';
import { Divider } from '../../../../../common/TableTools';
import { FormContainer } from '../../../../../components';
import { billingCyclesOptions, CustomerStatus } from '../../../../../consts';
import { useDateIntl } from '../../../../../helpers/format/date';
import {
  useBoolean,
  useBusinessContext,
  useIsRecyclingFacilityBU,
  useScrollOnError,
  useStores,
} from '../../../../../hooks';
import GenerateInvoicesQuickView from '../GenerateInvoicesQuickView/GenerateInvoicesQuickView';

import tableQuickViewStyles from '../../../../../common/TableTools/TableQuickView/css/styles.scss';
import { defaultValue, validationSchema } from './formikData';
import { FormikRunInvoicing, IRunInvoicingQuickViewContent } from './types';

const invoiceTargetOptions: ISelectOption[] = [
  { value: 'all', label: 'All Customers' },
  { value: 'specific', label: 'By Specific Customers' },
];

const I18N_PATH = 'pages.CustomerSubscriptionDetails.components.Summary.Summary.Text.';

const RunInvoicingQuickViewContent: React.FC<IRunInvoicingQuickViewContent> = ({
  onInvoicesSave,
}) => {
  const { customerGroupStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [customerOptions, setCustomerOptions] = useState<ISelectOption[]>([]);
  const customerService = useRef(new CustomerService());
  const [count, setCount] = useState<number>(0);
  const [isGenerateInvoicesOpen, openGenerateInvoices, closeGenerateInvoices] = useBoolean();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();
  const { t } = useTranslation();

  const isRecyclingFacility = useIsRecyclingFacilityBU();
  const { firstDayOfWeek } = useIntl();

  const formik = useFormik({
    initialValues: defaultValue,
    onSubmit: noop,
    validateOnChange: false,
    validationSchema,
  });

  useEffect(() => {
    (async () => {
      const invoicingCustomers = await customerService.current.requestForInvoicing({
        businessUnitId,
      });
      setCustomerOptions(
        invoicingCustomers
          .filter(customer => customer.name)
          .map(customer => ({
            value: customer.id,
            label: customer.name,
            ...(customer.status !== CustomerStatus.active && {
              badge: {
                text: t(
                  `Text.${customer.status === CustomerStatus.onHold ? 'OnHold' : 'Inactive'}`,
                ),
                borderRadius: 2,
                color: 'alert',
              },
            }),
          })),
      );
    })();
  }, [businessUnitId, t]);

  const { values, handleChange, errors, setFieldValue, setValues, isValidating } = formik;

  useScrollOnError(errors, !isValidating);

  const customerGroupOptions: ISelectOption[] = [
    { value: 0, label: 'All customer groups' },
    ...customerGroupStore.values
      .filter(
        customerGroup => isRecyclingFacility || customerGroup.type !== CustomerGroupType.walkUp,
      )
      .map(group => ({ value: group.id, label: group.description })),
  ];

  const mapFormValuesToRequest = useCallback(
    (formValues: FormikRunInvoicing): IOrderInvoicingRequest => ({
      ...formValues,
      endingDate: endOfDay(formValues.endingDate),
      customerGroupId: formValues.customerGroupId === 0 ? undefined : formValues.customerGroupId,
    }),
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        await validateYupSchema(values, validationSchema);
        const { total } = await OrderService.countInvoicingOrders(mapFormValuesToRequest(values), {
          businessUnitId,
        });

        setCount(total);
      } catch {
        setCount(0);
      }
    })();
  }, [mapFormValuesToRequest, values, businessUnitId]);

  const handleInvoiceTargetChange = useCallback(
    (name: string, value: string) => {
      if (value === 'all') {
        setValues({
          ...values,
          customerId: undefined,
          prepaid: true,
          onAccount: true,
          customerGroupId: 0,
        });
      } else {
        setValues({
          ...values,
          customerGroupId: undefined,
          prepaid: undefined,
          billingCycles: undefined,
          onAccount: undefined,
        });
      }

      setFieldValue(name, value);
    },
    [setFieldValue, setValues, values],
  );

  const invoicingOptions = mapFormValuesToRequest(values);
  const { dateFormat } = useDateIntl();

  return (
    <>
      <GenerateInvoicesQuickView
        businessUnitId={businessUnitId}
        isOpen={isGenerateInvoicesOpen}
        invoicingOptions={invoicingOptions}
        processedOrdersCount={count}
        backToOptions={closeGenerateInvoices}
        onCloseInvoicing={forceCloseQuickView}
        onInvoicesSave={onInvoicesSave}
      />
      <QuickViewContent
        rightPanelElement={
          <>
            <div className={tableQuickViewStyles.header}>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>
                  {t(`${I18N_PATH}RunInvoicing`)}
                </div>
                <div className={tableQuickViewStyles.quickViewDescription}>
                  {t(`${I18N_PATH}InvoicingOptions`)}
                </div>
              </div>
            </div>

            <Layouts.Scroll>
              <Layouts.Padding padding="3">
                <FormContainer formik={formik}>
                  <Calendar
                    label="Ending Date"
                    name="endingDate"
                    withInput
                    value={values.endingDate}
                    placeholder={t('Text.SetDate')}
                    firstDayOfWeek={firstDayOfWeek}
                    dateFormat={dateFormat}
                    onDateChange={setFieldValue}
                    error={errors.endingDate}
                  />

                  <Select
                    label="Invoice"
                    name="invoiceTarget"
                    options={invoiceTargetOptions}
                    value={values.invoiceTarget}
                    onSelectChange={handleInvoiceTargetChange}
                    nonClearable
                  />
                  {values.invoiceTarget === 'all' ? (
                    <>
                      <Select
                        label="Customer Group"
                        name="customerGroupId"
                        options={customerGroupOptions}
                        value={values.customerGroupId}
                        onSelectChange={setFieldValue}
                        nonClearable
                        error={errors.customerGroupId}
                      />
                      <Layouts.Margin bottom="1">
                        <Typography as="label" shade="desaturated" color="secondary">
                          {t(`${I18N_PATH}CustomerType`)}
                        </Typography>
                      </Layouts.Margin>
                      <Layouts.Flex>
                        <Layouts.Flex>
                          <Layouts.Margin right="1">
                            <Checkbox
                              name="prepaid"
                              value={values.prepaid}
                              onChange={handleChange}
                            />
                          </Layouts.Margin>
                          <Layouts.Margin right="2">
                            <Typography as="label" shade="desaturated" color="secondary">
                              {t(`${I18N_PATH}Prepaid`)}
                            </Typography>
                          </Layouts.Margin>
                        </Layouts.Flex>
                        <Layouts.Flex>
                          <Layouts.Margin right="1">
                            <Checkbox
                              name="onAccount"
                              value={values.onAccount}
                              onChange={handleChange}
                            />
                          </Layouts.Margin>
                          <Typography as="label" shade="desaturated" color="secondary">
                            {t(`${I18N_PATH}OnAccount`)}
                          </Typography>
                        </Layouts.Flex>
                      </Layouts.Flex>
                      <Layouts.Margin top="2">
                        <MultiSelect
                          name="billingCycles"
                          label={t(`${I18N_PATH}BillingCycle`)}
                          options={billingCyclesOptions}
                          value={values.billingCycles as string[]}
                          onSelectChange={setFieldValue}
                        />
                      </Layouts.Margin>
                    </>
                  ) : (
                    <>
                      <Typography
                        as="label"
                        shade="desaturated"
                        color="secondary"
                        htmlFor="customerId"
                      >
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
                  )}
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>
          </>
        }
        actionsElement={
          <>
            <Layouts.Flex justifyContent="space-between">
              <Typography color="secondary" fontWeight="bold">
                Orders included:
              </Typography>
              <Typography fontWeight="bold" variant="bodyLarge">
                {count}
              </Typography>
            </Layouts.Flex>
            <Divider both />
            <Layouts.Flex justifyContent="space-between">
              <Button onClick={closeQuickView}>Cancel</Button>
              <Button disabled={count === 0} onClick={openGenerateInvoices} variant="primary">
                Next →
              </Button>
            </Layouts.Flex>
          </>
        }
      />
    </>
  );
};

export default observer(RunInvoicingQuickViewContent);
