import React from 'react';
import { useHistory } from 'react-router';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import {
  fallback,
  useAggregatedFormatFrequency,
} from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

const DraftTableData: React.FC = () => {
  const { subscriptionDraftStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const history = useHistory();
  const { businessUnitId } = useBusinessContext();
  const aggregatedFormatFrequency = useAggregatedFormatFrequency();

  const handleRowClick = (subscriptionId: number) => {
    history.push(
      pathToUrl(Paths.RequestModule.Subscription.Edit, {
        businessUnit: businessUnitId,
        subscriptionId,
        entity: Routes.SubscriptionDraft,
      }),
    );
  };

  return (
    <>
      {subscriptionDraftStore.values.map(subscr => (
        <TableRow
          selected={subscr.id === subscriptionDraftStore.selectedEntity?.id}
          key={subscr.id}
          onClick={() => handleRowClick(subscr.id)}
        >
          <TableCell>
            <Typography>
              {subscr.startDate ? formatDateTime(subscr.startDate)?.date : fallback}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography color="information">{subscr.id}</Typography>
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
          <TableCell>{subscr.customer?.name}</TableCell>
          <TableCell right>
            <Typography fontWeight="bold">{formatCurrency(subscr.grandTotal)}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{startCase(subscr.billingCycle)}</Typography>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default observer(DraftTableData);
