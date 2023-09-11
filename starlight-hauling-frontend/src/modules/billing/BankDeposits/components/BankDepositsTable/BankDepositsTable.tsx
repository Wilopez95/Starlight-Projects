import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Checkbox, Typography } from '@starlightpro/shared-components';
import { lowerCase, noop, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { useIntl } from '@root/i18n/useIntl';

import { hasDataAttribute, isModal } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';
import { BankDepositStatus, BankDepositType } from '../../types';

import { IBankDepositsTable } from './types';

const I18N_PATH = 'modules.billing.BankDeposits.components.BankDepositsTable.Text.';

const BankDepositsTable: React.FC<IBankDepositsTable> = ({ tableRef, onSelect, onSort }) => {
  const { bankDepositStore } = useStores();
  const { formatDateTime, formatCurrency, currencySymbol } = useIntl();
  const { t } = useTranslation();
  const selectedBankDeposit = bankDepositStore.selectedEntity;

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      bankDepositStore.checkAll(e.target.checked);
    },
    [bankDepositStore],
  );

  const isAllChecked = bankDepositStore.isAllChecked;
  const checkedBankDeposits = bankDepositStore.checkedBankDeposits;
  const indeterminate = !isAllChecked && checkedBankDeposits.length > 0;

  return (
    <Table ref={tableRef}>
      <TableTools.Header>
        <TableCheckboxCell
          header
          name="AllBankDeposits"
          onChange={handleCheckAll}
          value={isAllChecked}
          indeterminate={indeterminate}
        />
        <TableTools.SortableHeaderCell store={bankDepositStore} onSort={onSort} sortKey="DATE">
          {t('Text.Date')}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={bankDepositStore}
          onSort={onSort}
          sortKey="DEPOSIT_TYPE"
        >
          {t(`${I18N_PATH}DepositType`)}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={bankDepositStore}
          onSort={onSort}
          sortKey="MERCHANT_ID"
        >
          {t(`${I18N_PATH}MerchantID`)}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell store={bankDepositStore} onSort={onSort} sortKey="COUNT">
          {t('Text.Count')}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={bankDepositStore}
          onSort={onSort}
          sortKey="SYNC_WITH_QB"
        >
          {t(`${I18N_PATH}SyncedWithQB`)}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell store={bankDepositStore} onSort={onSort} sortKey="STATUS">
          {t('Text.Status')}
        </TableTools.SortableHeaderCell>
        <TableTools.SortableHeaderCell
          store={bankDepositStore}
          onSort={onSort}
          sortKey="TOTAL"
          right
        >
          {t('Text.TotalP', { currencySymbol })}
        </TableTools.SortableHeaderCell>
      </TableTools.Header>
      <TableBody loading={bankDepositStore.loading} cells={8} noResult={bankDepositStore.noResult}>
        {bankDepositStore.values.map(item => (
          <TableRow
            key={item.id}
            selected={selectedBankDeposit?.id === item.id}
            onClick={e => {
              if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
                return;
              }

              if (onSelect) {
                onSelect(item);
              } else {
                bankDepositStore.selectEntity(item);
              }
            }}
          >
            <TableCheckboxCell
              name={`bankDeposit-${item.id}`}
              onChange={item.check}
              value={item.checked}
            />
            <TableCell>{formatDateTime(item.date).date}</TableCell>
            <TableCell>
              {item.depositType === BankDepositType.cashCheck
                ? t('Text.CashCheck')
                : startCase(lowerCase(item.depositType))}
            </TableCell>
            <TableCell>{item.merchantId}</TableCell>
            <TableCell>{item.count}</TableCell>
            <TableCell>
              <Checkbox
                id={`syncWithQB-${item.id}`}
                name="syncWithQB"
                value={item.synced}
                onChange={noop}
                disabled
              />
            </TableCell>
            <TableCell>
              <Badge
                bgColor={item.status === BankDepositStatus.locked ? 'grey' : 'success'}
                bgShade={item.status === BankDepositStatus.locked ? 'light' : 'desaturated'}
                color={item.status === BankDepositStatus.locked ? 'secondary' : 'success'}
                shade={item.status === BankDepositStatus.locked ? 'light' : 'standard'}
              >
                {startCase(lowerCase(item.status))}
              </Badge>
            </TableCell>
            <TableCell right>
              <Typography fontWeight="bold">{formatCurrency(item.total)}</Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(BankDepositsTable);
