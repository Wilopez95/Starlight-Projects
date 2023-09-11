import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableInfiniteScroll,
  TableRow,
} from '../../../../../common/TableTools';
import { hasDataAttribute, isModal } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';
import { getBadgeByStatus } from '../../helpers/getBadgeByStatus';

import { FinanceChargePreview } from './FinanceChargePreview/FinanceChargePreview';
import FinanceChargeTableHeader from './FinanceChargeTableHeader/FinanceChargeTableHeader';
import { IFinanceChargeTable } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'modules.billing.FinanceCharges.components.FinanceChargeTable.Text.';

const FinanceChargeTable: React.FC<IFinanceChargeTable> = ({
  showCustomer,
  tableBodyContainer,
  onSelect,
  onRequest,
}) => {
  const { financeChargeStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const { t } = useTranslation();

  return (
    <>
      <Helmet title={t('Titles.FinanceCharges')} />
      <Table className={styles.table}>
        <FinanceChargeTableHeader showCustomer={showCustomer} onSortChange={onRequest} />
        <TableBody
          loading={financeChargeStore.loading}
          cells={9}
          ref={tableBodyContainer}
          noResult={financeChargeStore.noResult}
        >
          {financeChargeStore.values.map(financeCharge => (
            <TableRow
              selected={financeCharge.id === financeChargeStore.selectedEntity?.id}
              key={financeCharge.id}
              onClick={e => {
                if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
                  return;
                }

                if (onSelect) {
                  onSelect(financeCharge);
                } else {
                  financeChargeStore.selectEntity(financeCharge);
                }
              }}
            >
              <TableCheckboxCell
                name={`financeCharge-${financeCharge.id}`}
                onChange={financeCharge.check}
                value={financeCharge.checked}
              />
              <TableCell>
                <Typography>{formatDateTime(financeCharge.createdAt as Date).date}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{financeCharge.id}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{getBadgeByStatus(financeCharge.status)}</Typography>
              </TableCell>
              {showCustomer ? (
                <>
                  <TableCell>
                    <Typography>{financeCharge.customer?.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      {financeCharge.customer?.onAccount
                        ? t(`${I18N_PATH}OnAccount`)
                        : t(`${I18N_PATH}Prepaid`)}
                    </Typography>
                  </TableCell>
                </>
              ) : null}
              <TableCell fallback="" className={styles.previewCell}>
                {financeCharge.pdfUrl ? <FinanceChargePreview src={financeCharge.pdfUrl} /> : null}
              </TableCell>
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(financeCharge.total)}</Typography>
              </TableCell>
              <TableCell right>
                <Typography fontWeight="bold">{formatCurrency(financeCharge.balance)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableInfiniteScroll
        onLoaderReached={onRequest}
        loaded={financeChargeStore.loaded}
        loading={financeChargeStore.loading}
        initialRequest={false}
      >
        loading finance charges
      </TableInfiniteScroll>
    </>
  );
};

export default observer(FinanceChargeTable);
