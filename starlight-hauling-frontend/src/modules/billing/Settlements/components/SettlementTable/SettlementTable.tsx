import React from 'react';
import { capitalize } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { useIntl } from '@root/i18n/useIntl';

import { Typography } from '../../../../../common';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableRow,
} from '../../../../../common/TableTools';
import { hasDataAttribute } from '../../../../../helpers';
import { useStores } from '../../../../../hooks';

import SettlementTableHeader from './SettlementTableHeader/SettlementTableHeader';
import { ISettlementTable } from './types';

const SettlementTable: React.FC<ISettlementTable> = ({ tableBodyContainer, onSort }) => {
  const { settlementStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();

  return (
    <Table>
      <SettlementTableHeader onSort={onSort} />
      <TableBody
        loading={settlementStore.loading}
        cells={8}
        ref={tableBodyContainer}
        noResult={settlementStore.noResult}
      >
        {settlementStore.values.map(settlement => (
          <TableRow
            selected={settlement.id === settlementStore.selectedEntity?.id}
            key={settlement.id}
            onClick={e => {
              if (hasDataAttribute(e, 'skipEvent')) {
                return;
              }

              settlementStore.selectEntity(settlement);
            }}
          >
            <TableCheckboxCell
              name={`settlement-${settlement.id}`}
              onChange={settlement.check}
              value={settlement.checked}
            />
            <TableCell>
              <Typography>{formatDateTime(settlement.date).date}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{capitalize(settlement.paymentGateway)}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{settlement.mid}</Typography>
            </TableCell>
            <TableCell>
              <Typography>{settlement.count}</Typography>
            </TableCell>
            <TableCell right>
              <Typography>{formatCurrency(settlement.amount)}</Typography>
            </TableCell>
            <TableCell right>
              <Typography>{formatCurrency(settlement.fees)}</Typography>
            </TableCell>
            <TableCell right>
              <Typography>{formatCurrency(settlement.adjustments)}</Typography>
            </TableCell>
            <TableCell right>
              <Typography>
                {formatCurrency(settlement.amount + settlement.adjustments + settlement.fees)}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(SettlementTable);
