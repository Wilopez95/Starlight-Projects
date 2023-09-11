import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Sentry from '@sentry/react';
import { Button, Layouts } from '@starlightpro/shared-components';
import { useFormik, validateYupSchema } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ICommonInvoicingRequest, OrderService } from '@root/api';
import { QuickViewContent, Typography, useQuickViewContext } from '@root/common';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { FormContainer } from '@root/components';
import { useBoolean, useBusinessContext, useStores } from '@root/hooks';
import GenerateInvoicesQuickView from '@root/modules/billing/Invoices/components/GenerateInvoicesQuickView/GenerateInvoicesQuickView';
import { GenerateInvoicingMode } from '@root/modules/billing/Invoices/components/GenerateInvoicesQuickView/types';

import { endOfDay } from 'date-fns';
import { ApiError } from '@root/api/base/ApiError';
import { defaultValue, validationSchema } from './formikData';
import FormSection from './FormSection';
import { type IRunInvoicingQuickViewContent, InvoiceTargetEnum } from './types';

const I18N_PATH = 'pages.Invoices.RunInvoicingMenu.';

const RunInvoicingQuickViewContent: React.FC<IRunInvoicingQuickViewContent> = ({
  onInvoicesSave,
}) => {
  const { businessLineStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0);
  const [orderCount, setOrdersCount] = useState<number>(0);
  const [isGenerateInvoicesOpen, openGenerateInvoices, closeGenerateInvoices] = useBoolean();
  const { t } = useTranslation();
  const { closeQuickView, forceCloseQuickView } = useQuickViewContext();

  useEffect(() => {
    if (!businessLineStore.sortedValues.length) {
      businessLineStore.request();
    }
  }, [businessLineStore, businessLineStore.sortedValues]);

  const formik = useFormik({
    initialValues: {
      ...defaultValue,
      businessLineIds: businessLineStore.sortedValues?.map(({ id }) => id),
    },
    onSubmit: noop,
    validateOnChange: false,
    validationSchema: validationSchema(t),
    enableReinitialize: true,
  });

  const { values } = formik;

  useEffect(() => {
    if (values.invoiceTarget === InvoiceTargetEnum.specific) {
      setSubscriptionCount(0);
      setOrdersCount(0);
    }
  }, [values.invoiceTarget]);

  const mappedFormValuesToRequest = useMemo(
    () =>
      ({
        ...values,
        billingDate: endOfDay(values.billingDate),
        customerGroupId: values.customerGroupId === 0 ? undefined : values.customerGroupId,
      } as ICommonInvoicingRequest),
    [values],
  );

  useEffect(() => {
    (async () => {
      try {
        await validateYupSchema(values, validationSchema(t));
        const { subscriptionsCount, ordersCount } =
          await OrderService.countInvoicingSubscriptionOrders(
            mappedFormValuesToRequest,
            businessUnitId,
          );

        setSubscriptionCount(subscriptionsCount);
        setOrdersCount(ordersCount);
      } catch (error: unknown) {
        const typedError = error as ApiError;
        Sentry.addBreadcrumb({
          category: 'SubscriptionOrder',
          message: `Subscription Orders Count Invoicing Error ${JSON.stringify(
            typedError?.message,
          )}`,
          data: {
            businessUnitId,
            mappedFormValuesToRequest,
          },
        });
        Sentry.captureException(typedError);
      }
    })();
  }, [mappedFormValuesToRequest, businessUnitId, values, t]);

  return (
    <>
      <GenerateInvoicesQuickView
        mode={GenerateInvoicingMode.OrdersAndSubscriptions}
        businessUnitId={businessUnitId}
        isOpen={isGenerateInvoicesOpen}
        invoicingOptions={mappedFormValuesToRequest}
        processedOrdersCount={orderCount}
        processedSubscriptionsCount={subscriptionCount}
        backToOptions={closeGenerateInvoices}
        onCloseInvoicing={forceCloseQuickView}
        onInvoicesSave={onInvoicesSave}
      />
      <QuickViewContent
        rightPanelElement={
          <>
            <Layouts.Padding bottom="3" className={tableQuickViewStyles.header}>
              <div className={tableQuickViewStyles.dataContainer}>
                <div className={tableQuickViewStyles.quickViewTitle}>
                  {t(`${I18N_PATH}RunInvoicing`)}
                </div>
                <div className={tableQuickViewStyles.quickViewDescription}>
                  {t(`${I18N_PATH}InvoicingOptions`)}
                </div>
              </div>
            </Layouts.Padding>
            <Layouts.Scroll>
              <Layouts.Padding padding="3" top="0">
                <FormContainer formik={formik}>
                  <FormSection />
                </FormContainer>
              </Layouts.Padding>
            </Layouts.Scroll>
            <Layouts.Padding padding="3">
              <Layouts.Flex justifyContent="space-between">
                <Typography color="default" shade="dark">
                  {t(`${I18N_PATH}SubscriptionsIncluded`)}:
                </Typography>
                <Typography fontWeight="medium" variant="bodyLarge">
                  {subscriptionCount}
                </Typography>
              </Layouts.Flex>
              <Layouts.Margin top="1" />
              <Layouts.Flex justifyContent="space-between">
                <Typography color="default" shade="dark">
                  {t(`${I18N_PATH}OrdersIncluded`)}:
                </Typography>
                <Typography fontWeight="medium" variant="bodyLarge">
                  {orderCount}
                </Typography>
              </Layouts.Flex>
            </Layouts.Padding>
          </>
        }
        actionsElement={
          <Layouts.Flex justifyContent="space-between">
            <Button onClick={closeQuickView}>{t(`${I18N_PATH}Cancel`)}</Button>
            <Button
              disabled={subscriptionCount + orderCount === 0}
              onClick={openGenerateInvoices}
              variant="primary"
            >
              {t(`${I18N_PATH}Next`)} →
            </Button>
          </Layouts.Flex>
        }
      />
    </>
  );
};

export default observer(RunInvoicingQuickViewContent);
