import React, { FC, useLayoutEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { OrdersView, OrdersViewProps } from '@starlightpro/recycling/views/OrdersView/OrdersView';

import { OrderStatusRoutes, Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import { validateOrderStatusParams } from '../OrderTable/helpers';
import { IOrderTableParams } from '../OrderTable/types';

const RecyclingOrdersTable: FC<Omit<OrdersViewProps, 'location'>> = props => {
  const location = useLocation();
  const { customerStore } = useStores();
  const { subPath: currentStatus } = useParams<IOrderTableParams>();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();
  const { t } = useTranslation();
  const selectedCustomer = customerStore.selectedEntity;

  useLayoutEffect(() => {
    if (!validateOrderStatusParams(currentStatus, true)) {
      const basePath = props.my ? Paths.OrderModule.MyOrders : Paths.OrderModule.Orders;

      const path = pathToUrl(basePath, {
        businessUnit: businessUnitId,
        subPath: OrderStatusRoutes.All,
      });

      history.push(path);
    }
  }, [businessUnitId, currentStatus, history, props.my]);

  const title = useMemo(
    () => t('Titles.CustomerOrders', { customerName: selectedCustomer?.name ?? '' }),
    [selectedCustomer?.name, t],
  );

  return (
    <>
      <Helmet title={title} />
      <OrdersView
        {...props}
        LinkComponent={Link}
        location={location}
        applicationUrl={document.location.origin}
      />
    </>
  );
};

export default RecyclingOrdersTable;
