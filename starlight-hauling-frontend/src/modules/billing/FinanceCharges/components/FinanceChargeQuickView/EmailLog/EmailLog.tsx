import React from 'react';
import { format } from 'date-fns-tz';
import { observer } from 'mobx-react-lite';

import { parseDate } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableTools,
} from '../../../../../../common/TableTools';
import { useStores } from '../../../../../../hooks';

import { getBadgeByStatus } from './helpers';

const EmailLog: React.FC = () => {
  const { financeChargeStore } = useStores();
  const { dateFormat } = useIntl();

  const loading = financeChargeStore.quickViewLoading;
  const currentFinCharge = financeChargeStore.selectedEntity;

  return (
    <Table>
      <TableTools.Header sticky={false}>
        <TableTools.HeaderCell>Date &amp; Time</TableTools.HeaderCell>
        <TableTools.HeaderCell>Status</TableTools.HeaderCell>
        <TableTools.HeaderCell right>Email</TableTools.HeaderCell>
      </TableTools.Header>
      <TableBody loading={loading} cells={3} noResult={currentFinCharge?.emails.length === 0}>
        {currentFinCharge?.emails.map(email => (
          <TableRow key={email.id}>
            <TableCell>{format(parseDate(email.createdAt), dateFormat.dateTime)}</TableCell>
            <TableCell>{getBadgeByStatus(email.status)}</TableCell>
            <TableCell right>{email.receiver}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default observer(EmailLog);
