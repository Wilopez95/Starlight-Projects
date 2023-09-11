import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts, Button, Switch, Typography } from '@starlightpro/shared-components';
import { FormikProvider, useFormik } from 'formik';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { TablePageContainer } from '@root/core/common/TableTools';
import { useCleanup, useStores } from '@root/core/hooks';
import { InvoiceService } from '@root/finance/api/invoice/invoice';

import { IInvoiceLayout, INVOICE_STATUSES } from './types';

import style from './css/styles.scss';

const InvoiceLayout: React.FC<IInvoiceLayout> = ({ children, pageContainerRef }) => {
  const { t } = useTranslation();
  const { customerStore, invoiceStore, paymentStore } = useStores();
  const I18N_PATH = 'pages.Invoices.';

  const customer = customerStore.selectedEntity!;

  const formik = useFormik({
    initialValues: { openOnly: invoiceStore.showOpenOnly },
    onSubmit: noop,
  });
  const { values, setFieldValue } = formik;

  const setOpenOnlyValue = useCallback(
    (newValue: boolean) => {
      setFieldValue('openOnly', newValue);
      invoiceStore.setShowOnlyOpen(newValue);
    },
    [invoiceStore, setFieldValue],
  );

  useCleanup(invoiceStore);

  const onShowOpenOnlyChange = () => {
    const newValue = !values.openOnly;

    setOpenOnlyValue(newValue);

    invoiceStore.request({
      customerId: customer.id,
    });
  };

  const handleCreatePayment = useCallback(() => {
    paymentStore.toggleQuickView(true);
  }, [paymentStore]);

  const handleDownloadInvoices = useCallback(() => {
    if (invoiceStore.checkedInvoices.length > 0) {
      const invoiceQueryParams = new URLSearchParams();
      const invoiceIds = invoiceStore.checkedInvoices.map(({ id }) => id);

      invoiceIds.forEach((id) => invoiceQueryParams.append('invoiceIds', id.toString()));

      InvoiceService.downloadInvoices(invoiceQueryParams.toString());
    }
  }, [invoiceStore.checkedInvoices]);

  const checkedInvoices = useMemo(
    () =>
      invoiceStore.checkedInvoices.filter(
        ({ status }) => status !== INVOICE_STATUSES.closed && status !== INVOICE_STATUSES.writeOff,
      ).length,
    [invoiceStore.checkedInvoices],
  );

  return (
    <Layouts.Box
      as={Layouts.Flex}
      backgroundColor='white'
      height='100%'
      scrollY='hidden'
      direction='column'
    >
      <Layouts.Flex as={Layouts.Padding} padding='3' justifyContent='space-between'>
        <Layouts.Flex alignItems='center'>
          <Typography variant='headerThree'>{t(`${I18N_PATH}Title`)}</Typography>
          {invoiceStore.values.length > 0 && invoiceStore.count && (
            <Typography as={Layouts.Padding} left='2' variant='bodyMedium' color='secondary'>
              {t(`${I18N_PATH}ShownResults`, {
                count: invoiceStore.values.length,
                total: invoiceStore.count,
              })}
            </Typography>
          )}
        </Layouts.Flex>

        <Layouts.Flex alignItems='center'>
          {invoiceStore.checkedInvoices.length > 0 && (
            <Layouts.Flex>
              <Layouts.Flex alignItems='center'>
                <Typography>
                  {t(`${I18N_PATH}InvoicesSelected`, {
                    count: invoiceStore.checkedInvoices.length ?? 0,
                  })}
                </Typography>
                <Layouts.Margin left='3' right='3'>
                  <Button onClick={handleDownloadInvoices}>{t(`${I18N_PATH}Download`)}</Button>
                </Layouts.Margin>
              </Layouts.Flex>
            </Layouts.Flex>
          )}

          <FormikProvider value={formik}>
            <Switch name='switch' onChange={onShowOpenOnlyChange} value={values.openOnly}>
              {t(`${I18N_PATH}ShowOpenOnly`)}
            </Switch>
          </FormikProvider>
          {checkedInvoices > 0 && (
            <Layouts.Margin left='2' right='0.5'>
              <Button variant='primary' onClick={handleCreatePayment}>
                {t(`${I18N_PATH}Payment`)}
              </Button>
            </Layouts.Margin>
          )}
        </Layouts.Flex>
      </Layouts.Flex>
      <TablePageContainer ref={pageContainerRef} className={style.invoiceTableContainer}>
        {children}
      </TablePageContainer>
    </Layouts.Box>
  );
};

export default observer(InvoiceLayout);
