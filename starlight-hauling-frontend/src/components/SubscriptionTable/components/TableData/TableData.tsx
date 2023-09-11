import React from 'react';
import { Link } from 'react-router-dom';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { TableCell, TableRow } from '@root/common/TableTools';
import {
  fallback,
  useAggregatedFormatFrequency,
} from '@root/common/TableTools/TableData/helpers/useFormatFrequency';
import { Paths, SubscriptionTabRoutes, subscriptionTabStatus } from '@root/consts';
import { hasDataAttribute, isModal, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores, useSubscriptionSelectedTab } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

const TableData: React.FC = () => {
  const { subscriptionStore } = useStores();
  const { formatDateTime, formatCurrency } = useIntl();
  const { businessUnitId } = useBusinessContext();
  const selectedTab = useSubscriptionSelectedTab();
  const isActiveTab = selectedTab === SubscriptionTabRoutes.Active;

  const aggregatedFormatFrequency = useAggregatedFormatFrequency();

  return (
    <>
      {subscriptionStore.values.map(subscr => (
        <TableRow
          selected={subscr.id === subscriptionStore.selectedEntity?.id}
          key={subscr.id}
          onClick={e => {
            if (hasDataAttribute(e, 'skipEvent') || isModal(e)) {
              return;
            }
            subscriptionStore.selectEntity(subscr);
          }}
        >
          <TableCell>
            <Typography>
              {subscr.startDate ? formatDateTime(subscr.startDate)?.date : fallback}
            </Typography>
          </TableCell>
          <TableCell>
            <Link
              to={pathToUrl(Paths.CustomerSubscriptionModule.Details, {
                businessUnit: businessUnitId,
                subscriptionId: subscr.id,
                customerId: subscr.customer?.originalId,
                tab: subscriptionTabStatus.get(subscr.status),
              })}
            >
              <Typography color="information">{subscr.id}</Typography>
            </Link>
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
          {isActiveTab ? (
            <TableCell>
              <Typography>{formatDateTime(subscr.nextServiceDate)?.date}</Typography>
            </TableCell>
          ) : null}
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

export default observer(TableData);
