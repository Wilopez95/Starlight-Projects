import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Layouts, Navigation, NavigationConfigItem } from '@starlightpro/shared-components';
import { isNil, startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Badge, Typography } from '@root/common';
import tableQuickViewStyles from '@root/common/TableTools/TableQuickView/css/styles.scss';
import { OrderHistory } from '@root/components';
import { Paths } from '@root/consts';
import { getColorByStatus, pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { DeferredPaymentsParams } from '@root/modules/billing/DeferredPayments/pages/types';

import { orderQuickViewNavigationConfigs } from '../navigationConfig';
import OrderInformation from '../OrderInformation/OrderInformation';

import { IOrderQuickViewRightPanel } from './types';

const I18N_PATH = 'quickViews.OrderQuickView.RightPanel.Text.';

const OrderQuickViewRightPanel: React.FC<IOrderQuickViewRightPanel> = ({ onReschedule }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { orderStore, paymentStore } = useStores();
  const [currentTab, setCurrentTab] = useState<NavigationConfigItem>(
    orderQuickViewNavigationConfigs[0],
  );
  const order = orderStore.selectedEntity;

  const { id: orderId } = useParams<DeferredPaymentsParams>();
  const { businessUnitId } = useBusinessContext();

  const nextOrderIndex = useMemo(() => {
    if (orderId && paymentStore.selectedEntity?.orders) {
      const orderIndex = paymentStore.selectedEntity.orders.findIndex(
        orderElement => Number(orderElement.id) === Number(orderId),
      );

      return !isNil(orderIndex) && orderIndex + 1 < paymentStore.selectedEntity.orders.length
        ? orderIndex + 1
        : undefined;
    }
  }, [orderId, paymentStore]);

  const handleNextOrderClick = useCallback(() => {
    if (nextOrderIndex && paymentStore.selectedEntity?.orders) {
      const newPath = pathToUrl(Paths.BillingModule.DeferredPayments, {
        businessUnit: businessUnitId,
        paymentId: paymentStore.selectedEntity.id,
        id: paymentStore.selectedEntity.orders[nextOrderIndex].id,
      });

      history.push(newPath);
    }
  }, [businessUnitId, history, nextOrderIndex, paymentStore.selectedEntity]);

  if (!order) {
    return null;
  }

  let component: React.ReactElement | null = null;

  switch (currentTab.key) {
    case 'information':
      component = <OrderInformation onReschedule={onReschedule} order={order} />;
      break;
    case 'history':
      component = <OrderHistory orderId={order.id} />;
      break;
    default:
      return null;
  }

  const badgeColor = getColorByStatus(order.status);

  const url = pathToUrl(
    order.status === 'invoiced'
      ? Paths.CustomerJobSiteModule.InvoicedOrders
      : Paths.CustomerJobSiteModule.OpenOrders,
    {
      businessUnit: businessUnitId,
      customerId: order.customer.originalId,
      jobSiteId: order.jobSite.originalId,
      id: order.id,
    },
  );

  return (
    <>
      <div className={tableQuickViewStyles.header}>
        <div className={tableQuickViewStyles.dataContainer}>
          <div className={tableQuickViewStyles.quickViewTitle}>
            {t(`${I18N_PATH}Order`)} #
            <Link to={url}>
              <Typography as="span" color="information">
                {order.id}
              </Typography>
            </Link>
          </div>
          <Layouts.Box width="100%">
            <Layouts.Flex justifyContent="space-between">
              <Badge borderRadius={2} color={badgeColor}>
                {startCase(order.status)}
              </Badge>
              {nextOrderIndex ? (
                <Typography color="information" onClick={handleNextOrderClick}>
                  {t(`${I18N_PATH}NextRelatedOrder`)} →
                </Typography>
              ) : null}
            </Layouts.Flex>
          </Layouts.Box>
        </div>
        <Layouts.Margin top="2">
          <Navigation
            activeTab={currentTab}
            configs={orderQuickViewNavigationConfigs}
            onChange={setCurrentTab}
            border
            withEmpty
          />
        </Layouts.Margin>
      </div>

      <Layouts.Scroll rounded>
        <Layouts.Padding padding="3">{component}</Layouts.Padding>
      </Layouts.Scroll>
    </>
  );
};

export default observer(OrderQuickViewRightPanel);
