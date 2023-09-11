import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { useBusinessContext, useCleanup, useStores } from '../../../../../../hooks';

const I18N_PATH = 'quickViews.BatchStatement.BatchStatementQuickView.CustomersTable.';
const CustomersTable: React.FC = () => {
  const { customerStore, batchStatementStore } = useStores();
  const { formatCurrency } = useIntl();
  const { t } = useTranslation();

  const checkedCustomers = customerStore.checkedCustomers;
  const isAllChecked = customerStore.isAllChecked;
  const indeterminate = !isAllChecked && checkedCustomers.length > 0;
  const isLoading = customerStore.loading;

  useCleanup(customerStore);
  const { businessUnitId } = useBusinessContext();

  useEffect(() => {
    customerStore.checkAll(false);
  }, [customerStore]);

  useEffect(() => {
    if (customerStore.values.length > 0) {
      const customerIds = customerStore.values.map(({ id }) => id);

      batchStatementStore.requestPreviousStatementsBalance(customerIds);
    }
  }, [batchStatementStore, customerStore.values]);

  const loadMore = useCallback(() => {
    customerStore.request({ businessUnitId });
  }, [businessUnitId, customerStore]);

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      customerStore.checkAll(e.target.checked);
    },
    [customerStore],
  );

  return (
    <>
      <Table>
        <TableTools.Header sticky={false}>
          <TableCheckboxCell
            header
            indeterminate={indeterminate}
            onChange={handleCheckAll}
            name="AllCustomers"
            value={isAllChecked}
          />
          <TableTools.HeaderCell>{t(`${I18N_PATH}Name`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}CurrentBalance`)}, $</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}PreviousStatement`)}, $</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}ThisStatement`)}, $</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody cells={4} loading={isLoading}>
          {customerStore.values?.map(customer => {
            const prevBalance = batchStatementStore?.previousStatementsBalance?.find(
              ({ id }) => +id === customer.id,
            );

            return (
              <TableRow key={customer.id}>
                <TableCheckboxCell
                  onChange={customer.check}
                  name={customer.name}
                  value={customer.checked}
                />
                <TableCell>{customer?.name}</TableCell>
                <TableCell>{formatCurrency(customer?.balance)}</TableCell>
                <TableCell>{formatCurrency(prevBalance?.statementBalance)}</TableCell>
                <TableCell />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={loadMore}
        loaded={customerStore.loaded}
        loading={customerStore.loading}
      >
        {t(`${I18N_PATH}LoadingCustomers`)}
      </TableInfiniteScroll>
    </>
  );
};

export default observer(CustomersTable);
