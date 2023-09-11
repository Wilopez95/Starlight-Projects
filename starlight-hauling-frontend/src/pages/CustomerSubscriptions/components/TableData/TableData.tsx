import React, { useCallback } from 'react';
import { useHistory, useParams } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { ClippableTypography, Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import {
  fallback,
  useAggregatedFormatFrequency,
} from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { hasDataAttribute, isModal, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores, useSubscriptionSelectedTab } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

import { CustomerSubscriptionsParams } from '../../types';

const TableData: React.FC = () => {
  const { subscriptionStore } = useStores();
  const { formatCurrency, formatDateTime } = useIntl();
  const aggregatedFormatFrequency = useAggregatedFormatFrequency();
  const { customerId } = useParams<CustomerSubscriptionsParams>();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const selectedTab = useSubscriptionSelectedTab();
  const isActiveTab = selectedTab === SubscriptionTabRoutes.Active;

  const handleRedirect = useCallback(
    (subscriptionId: number) => {
      history.push(
        pathToUrl(Paths.CustomerSubscriptionModule.Details, {
          customerId,
          businessUnit: businessUnitId,
          tab: selectedTab,
          subscriptionId,
        }),
      );
    },
    [businessUnitId, customerId, history, selectedTab],
  );

  return (
    <>
      {subscriptionStore.values.map(subscription => (
        <TableRow
          selected={subscription.id === subscriptionStore.selectedEntity?.id}
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
            <Layouts.Box maxWidth="150px">
              <ClippableTypography>{subscription.jobSiteShortAddress}</ClippableTypography>
            </Layouts.Box>
          </TableCell>
          {isActiveTab ? (
            <TableCell>
              <Typography>{formatDateTime(subscription.nextServiceDate).date}</Typography>
            </TableCell>
          ) : null}
          <TableCell>
            <Typography>{formatCurrency(subscription.grandTotal)}</Typography>
          </TableCell>
          <TableCell>
            <Typography>{startCase(subscription.billingCycle)}</Typography>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default observer(TableData);
