import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { OrdersViewProps } from '@starlightpro/recycling/views/OrdersView/OrdersView';

import OrderTable from '@root/components/OrderTable/OrderTable';
import RecyclingOrders from '@root/components/RecyclingOrders/RecyclingOrders';
import { RecyclingOrdersRouteParams } from '@root/components/RecyclingOrders/types';
import { useIsRecyclingFacilityBU } from '@root/hooks';

export const OrdersPage: React.FC<Pick<OrdersViewProps, 'my'>> = ({ my }) => {
  const { t } = useTranslation();
  const match = useRouteMatch<RecyclingOrdersRouteParams>();
  const isRecycling = useIsRecyclingFacilityBU();
  const title = t(`Titles.${my ? 'MyOrders' : 'Orders'}`);

  return (
    <>
      <Helmet title={title} />
      {isRecycling ? (
        <RecyclingOrders my={my} title={title} match={match} />
      ) : (
        <OrderTable mine={my} />
      )}
    </>
  );
};
