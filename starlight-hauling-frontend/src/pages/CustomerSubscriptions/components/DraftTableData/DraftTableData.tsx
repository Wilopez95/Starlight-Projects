import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import {
  fallback,
  useAggregatedFormatFrequency,
} from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import { Paths } from '@root/consts';
import { hasDataAttribute, isModal, pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores, useSubscriptionSelectedTab } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { CustomerSubscriptionsParams } from '../../types';

const DraftTableData: React.FC = () => {
  const { subscriptionDraftStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const aggregatedFormatFrequency = useAggregatedFormatFrequency();
  const { customerId } = useParams<CustomerSubscriptionsParams>();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();

  const selectedTab = useSubscriptionSelectedTab();

  const handleRedirect = useCallback(
    (subscriptionId: number) => {
      history.push(
        pathToUrl(Paths.CustomerSubscriptionModule.Details, {
          subscriptionId,
          customerId,
          businessUnit: businessUnitId,
          tab: selectedTab,
        }),
      );
    },
    [businessUnitId, customerId, history, selectedTab],
  );

  useCleanup(subscriptionDraftStore);

  return (
    <>
      {subscriptionDraftStore.values.map(subscription => (
        <TableRow
          selected={subscription.id === subscriptionDraftStore.selectedEntity?.id}
          key={subscription.id}
          onClick={e => {
            if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
              return;
            }

            handleRedirect(subscription.id);
          }}
        >
          <TableCell>
            <Typography>
              {subscription.startDate ? formatDateTime(subscription.startDate).date : fallback}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography color="information">{subscription.id}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{subscription.businessLine?.name}</Typography>
          </TableCell>
          <TableCell>
            <Typography>
              {aggregatedFormatFrequency(subscription.serviceFrequencyAggregated)}
            </Typography>
          </TableCell>
          <TableCell>
            <Typography>{subscription.jobSiteShortAddress}</Typography>
          </TableCell>
          <TableCell right>
            <Typography>{formatCurrency(subscription.grandTotal)}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{subscription.customer?.billingCycle}</Typography>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default observer(DraftTableData);
