import React from 'react';
import { Typography } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { TableCell, TableRow } from '@root/core/common/TableTools';
import {
  fallback,
  useAggregatedFormatFrequency,
} from '@root/core/common/TableTools/TableData/helpers/useFormatFrequency';
import { hasDataAttribute, isModal } from '@root/core/helpers';
import { useStores } from '@root/core/hooks';
import { useIntl } from '@root/core/i18n/useIntl';

const TableData: React.FC = () => {
  const { subscriptionStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const aggregatedFormatFrequency = useAggregatedFormatFrequency();

  return (
    <>
      {subscriptionStore.values.map((subscr) => (
        <TableRow
          selected={subscr.id === subscriptionStore.selectedEntity?.id}
          key={subscr.id}
          onClick={(e) => {
            if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
              return;
            }
            subscriptionStore.selectEntity(subscr);
          }}
        >
          <TableCell>
            <Typography>
              {subscr.startDate ? formatDateTime(subscr.startDate).date : fallback}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography color='information'>{subscr.id}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{subscr.businessLine?.name}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{startCase(subscr.serviceName)}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{aggregatedFormatFrequency(subscr.serviceFrequencyAggregated)}</Typography>
          </TableCell>
          <TableCell>
            {/* TODO  add Next Date when API ready according to HAULING-1404 */}
            <Typography>{fallback}</Typography>
          </TableCell>
          <TableCell>{startCase(subscr.paymentMethod)}</TableCell>
          <TableCell>
            <Typography fontWeight='bold'>{formatCurrency(subscr.grandTotal)}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{startCase(subscr.billingCycle)}</Typography>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default observer(TableData);
