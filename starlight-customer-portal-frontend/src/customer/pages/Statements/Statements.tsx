import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Button, Layouts, Typography } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableHeadCell,
  TableHeader,
  TableRow,
  TableScrollContainer,
  TableSortableHeadCell,
} from '@root/core/common/TableTools';
import { SortType, StatementSorting } from '@root/core/consts';
import { parseDate } from '@root/core/helpers';
import { useCleanup, useStores, useTimeZone } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';
import { CustomerNavigation, CustomerPortalLayout, CustomerStyles } from '@root/customer/layouts';
import { StatementService } from '@root/finance/api/statement/statement';

const I18N_PATH = 'pages.Statements.';

const Statements: React.FC = () => {
  const { statementStore, customerStore } = useStores();
  const { format } = useTimeZone();
  const { dateFormat, formatCurrency } = useIntl();
  const { t } = useTranslation();

  const selectedStatement = statementStore.selectedEntity;
  const selectedCustomer = customerStore.selectedEntity;

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      statementStore.checkAll(e.target.checked);
    },
    [statementStore],
  );

  const loadStatements = useCallback(() => {
    if (selectedCustomer) {
      statementStore.requestByCustomer(+selectedCustomer.id);
    }
  }, [selectedCustomer, statementStore]);

  const isAllChecked = statementStore.isAllChecked;
  const checkedStatements = statementStore.checkedStatements;
  const indeterminate = !isAllChecked && checkedStatements.length > 0;
  const navigationRef = useRef<HTMLDivElement>(null);

  const selectedStatementsIds = useMemo(() => {
    return checkedStatements.map((statement) => `id=${statement.id}`).join('&');
  }, [checkedStatements]);

  const handleStatementDownload = useCallback(() => {
    if (selectedStatementsIds) {
      StatementService.downloadStatements(selectedStatementsIds);
    }
  }, [selectedStatementsIds]);

  useEffect(() => {
    loadStatements();
  }, [loadStatements]);

  useCleanup(statementStore);
  const handleChangeSort = useCallback(
    (sortBy: StatementSorting, sortOrder: SortType) => {
      statementStore.setSort(sortBy, sortOrder);
      loadStatements();
    },
    [statementStore, loadStatements],
  );

  return (
    <CustomerPortalLayout>
      <Helmet title={t('Titles.Statements')} />
      <CustomerNavigation ref={navigationRef} />
      <CustomerStyles.PageContainer>
        <CustomerStyles.TitleContainer>
          <Typography variant='headerThree'>{t(`${I18N_PATH}title`)}</Typography>
          <Layouts.Flex alignItems='center'>
            {checkedStatements.length !== 0 && (
              <Button variant='primary' onClick={handleStatementDownload}>
                {t(`${I18N_PATH}downloadButtonText`)}
              </Button>
            )}
          </Layouts.Flex>
        </CustomerStyles.TitleContainer>
        <TableScrollContainer>
          <Table>
            <TableHeader>
              <TableCheckboxCell
                header
                name='AllStatements'
                onChange={handleCheckAll}
                value={isAllChecked}
                indeterminate={indeterminate}
              />
              <TableSortableHeadCell
                tableRef={navigationRef}
                sortKey='CREATED_AT'
                onSort={handleChangeSort}
                currentSortBy={statementStore.sortBy}
                sortOrder={statementStore.sortOrder}
              >
                <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
                  {t(`${I18N_PATH}StatementsGrid.created`)}
                </Typography>
              </TableSortableHeadCell>
              <TableHeadCell>
                <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
                  {t(`${I18N_PATH}StatementsGrid.statementDate`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
                  {t(`${I18N_PATH}StatementsGrid.endDate`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell>
                <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
                  {t(`${I18N_PATH}StatementsGrid.numberOfInvoices`)}
                </Typography>
              </TableHeadCell>
              <TableHeadCell right>
                <Typography variant='bodyMedium' color='secondary' shade='desaturated'>
                  {t(`${I18N_PATH}StatementsGrid.balance`)}
                </Typography>
              </TableHeadCell>
            </TableHeader>
            <TableBody
              loading={statementStore.loading}
              cells={6}
              noResult={statementStore.noResult}
            >
              {statementStore.values.map((item) => (
                <TableRow key={item.id} selected={selectedStatement?.id === item.id}>
                  <TableCheckboxCell
                    name={`statement-${item.id}`}
                    onChange={item.check}
                    value={item.checked}
                  />
                  <TableCell>{format(parseDate(item.createdAt), dateFormat.date)}</TableCell>
                  <TableCell>{format(parseDate(item.statementDate), dateFormat.date)}</TableCell>
                  <TableCell>{format(parseDate(item.endDate), dateFormat.date)}</TableCell>
                  <TableCell>{item.invoicesCount}</TableCell>
                  <TableCell right>
                    <Typography fontWeight='bold'>{formatCurrency(item.balance)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableScrollContainer>
      </CustomerStyles.PageContainer>
    </CustomerPortalLayout>
  );
};

export default observer(Statements);
