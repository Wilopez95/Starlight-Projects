import React, { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { TableInfiniteScroll, TableScrollContainer } from '@root/core/common/TableTools';
import TableSearch from '@root/core/common/TableTools/TableSearch/TableSearch';
import { Paths } from '@root/core/consts';
import { pathToUrl } from '@root/core/helpers';
import { useCleanup, useStores } from '@root/core/hooks';
import InvoiceTable from '@root/finance/components/InvoiceTable/InvoiceTable';
import InvoiceLayout from '@root/finance/layouts/InvoiceLayout/InvoiceLayout';
import { IInvoicePage } from '@root/finance/pages/Invoice/types';
import OrderInvoiceQuickView from '@root/finance/quickviews/InvoiceDetails/InvoiceDetailsQuickView';
import PaymentQuickView from '@root/finance/quickviews/PaymentQuickView/PaymentQuickView';
import { Invoice } from '@root/finance/stores/invoice/Invoice';

import Styles from './InvoicesStyles';

const I18N_PATH = 'modules.finance.components.Invoice.';

const InvoicePage: React.FC<IInvoicePage> = ({ customerId, tabContainer }) => {
  const { invoiceStore, paymentStore } = useStores();
  const history = useHistory();
  const { t } = useTranslation();
  const id = useParams();

  const tableScrollContainer = useRef<HTMLDivElement>(null);
  const tableBodyContainer = useRef<HTMLTableSectionElement>(null);

  const requestAllInvoices = useCallback(() => {
    invoiceStore.request({
      customerId: customerId,
    });
  }, [customerId, invoiceStore]);

  const onSort = useCallback(() => {
    invoiceStore.cleanup();
    requestAllInvoices();
  }, [invoiceStore, requestAllInvoices]);

  const onSearch = useCallback(
    (query: string) => {
      invoiceStore.cleanup();
      invoiceStore.setQuery(query);
      requestAllInvoices();
    },
    [invoiceStore, requestAllInvoices],
  );

  useCleanup(paymentStore);
  const handleRowClick = useCallback(
    (invoice: Invoice) => {
      invoiceStore.selectEntity(invoice);

      const newPath = pathToUrl(`${Paths.Invoices}`, {
        id: invoice.id,
        customerId: customerId,
      });

      history.push(newPath);
    },
    [customerId, history, invoiceStore],
  );

  const handleClose = useCallback(() => {
    const newPath = pathToUrl(Paths.Invoices, {
      customerId: customerId,
      id: undefined,
    });

    history.push(newPath);
  }, [customerId, history]);

  useEffect(() => {
    if (id) {
      const query = async () => {
        const invoice = await invoiceStore.requestDetailed(+id);

        if (invoice) {
          invoiceStore.selectEntity(invoice);
        }
      };

      query();
    }
  }, [id, invoiceStore]);

  return (
    <>
      <PaymentQuickView
        tableContainerRef={tabContainer}
        condition={paymentStore.isOpenQuickView}
        onReload={onSort}
      />
      <InvoiceLayout>
        <TableSearch onSearch={onSearch} placeholder={t(`${I18N_PATH}Placeholder`)} />
        <Styles.PageContainer>
          <OrderInvoiceQuickView
            store={invoiceStore}
            condition={invoiceStore.isOpenQuickView}
            tabContainer={tabContainer}
            onClose={handleClose}
          />
          <TableScrollContainer ref={tableScrollContainer}>
            <InvoiceTable
              tableBodyContainer={tableBodyContainer}
              tableScrollContainer={tableScrollContainer}
              onSort={onSort}
              onSelect={handleRowClick}
              selectable
            />
            <TableInfiniteScroll
              onLoaderReached={requestAllInvoices}
              loaded={invoiceStore.loaded}
              loading={invoiceStore.loading}
            >
              {t(`${I18N_PATH}LoadMore`)}
            </TableInfiniteScroll>
          </TableScrollContainer>
        </Styles.PageContainer>
      </InvoiceLayout>
    </>
  );
};

export default observer(InvoicePage);
