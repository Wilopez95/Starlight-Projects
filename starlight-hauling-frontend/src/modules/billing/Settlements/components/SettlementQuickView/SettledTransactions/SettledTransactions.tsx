import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { convertDates } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { useBusinessContext, useStores } from '../../../../../../hooks';
import { SettlementService } from '../../../api/settlement';
import { ISettlementTransaction } from '../../../types';

const fallback = '-';

const I18N_PATH =
  'modules.billing.Settlements.components.SettlementQuickView.SettledTransactions.Text.';
const LIMIT = 25;

const SettledTransactions: React.FC = () => {
  const { businessUnitId } = useBusinessContext();
  const { settlementStore } = useStores();
  const { formatCurrency } = useIntl();
  const [transactions, setTransactions] = useState<ISettlementTransaction[]>([]);
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);

  const currentSettlement = settlementStore.selectedEntity;

  const loadMore = useCallback(async () => {
    if (currentSettlement) {
      setLoading(true);

      const response = await SettlementService.getSettlementTransactions({
        settlementId: currentSettlement.id,
        offset,
        limit: LIMIT,
      });

      setTransactions(prevTransactions =>
        prevTransactions.concat(response.settlementTransactions.map(convertDates)),
      );

      if (
        response.settlementTransactions.length === 0 ||
        response.settlementTransactions.length !== LIMIT
      ) {
        setLoaded(true);
      }

      setOffset(offset + LIMIT);
      setLoading(false);
    }
  }, [currentSettlement, offset]);

  useEffect(() => {
    (async () => {
      setOffset(0);
      setLoading(false);
      setLoaded(false);
      setTransactions([]);

      if (currentSettlement) {
        setLoading(true);

        const response = await SettlementService.getSettlementTransactions({
          settlementId: currentSettlement.id,
          offset: 0,
          limit: LIMIT,
        });

        setTransactions(prevTransactions =>
          prevTransactions.concat(response.settlementTransactions.map(convertDates)),
        );

        if (
          response.settlementTransactions.length === 0 ||
          response.settlementTransactions.length !== LIMIT
        ) {
          setLoaded(true);
        }

        setOffset(offsetData => offsetData + LIMIT);
        setLoading(false);
      }
    })();
  }, [currentSettlement]);

  return (
    <>
      <Table>
        <TableTools.Header>
          <TableTools.HeaderCell>{t('Text.Customer')}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}TransactionNote`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Amount`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Fee`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell>{t(`${I18N_PATH}Adjustment`)}</TableTools.HeaderCell>
          <TableTools.HeaderCell right>{t(`${I18N_PATH}Net`)}</TableTools.HeaderCell>
        </TableTools.Header>
        <TableBody cells={6} loading={false} noResult={!transactions.length}>
          {transactions?.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell>
                {!transaction.payment ||
                transaction?.payment?.customer?.businessUnitId?.toString() !== businessUnitId
                  ? fallback
                  : transaction.payment.customer?.name}
              </TableCell>
              <TableCell>{transaction.transactionNote}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>{formatCurrency(transaction.fee)}</TableCell>
              <TableCell>{formatCurrency(transaction.adjustment)}</TableCell>
              <TableCell right>
                <Typography variant="bodyMedium" fontWeight="bold">
                  {formatCurrency(transaction.amount + transaction.fee + transaction.adjustment)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={loadMore}
        loaded={loaded}
        loading={loading}
        initialRequest={false}
      />
    </>
  );
};

export default observer(SettledTransactions);
