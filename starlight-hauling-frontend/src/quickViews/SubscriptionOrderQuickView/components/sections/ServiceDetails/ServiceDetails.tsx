import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { Divider } from '@root/common/TableTools';
import { DetailColumnItem, TotalBlock } from '@root/pages/CustomerSubscriptionDetails/components';
import { getServiceOrderById } from '@root/quickViews/SubscriptionOrderQuickView/helpers/helpers';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

const I18N_PATH = 'quickViews.SubscriptionOrderQuickView.components.sections.ServiceDetails.';

const ServiceDetails: React.FC<{
  subscription: Subscription;
  subscriptionOrder: SubscriptionOrder;
  isWorkOrderView?: boolean;
}> = ({ subscription, subscriptionOrder, isWorkOrderView = false }) => {
  const { t } = useTranslation();

  const serviceOrder = useMemo(
    () => getServiceOrderById(subscription, subscriptionOrder),
    [subscription, subscriptionOrder],
  );

  const price = serviceOrder?.price ?? subscriptionOrder?.price;
  const quantity = serviceOrder?.quantity ?? subscriptionOrder?.quantity;

  return (
    <Layouts.Margin top="2" bottom="2">
      <Divider both />
      <Typography variant="headerThree">{t(`${I18N_PATH}Services`)}</Typography>
      <Layouts.Flex as={Layouts.Margin} bottom="3" justifyContent="space-between">
        <Layouts.Flex as={Layouts.Margin} right="3">
          <Layouts.Box width="300px">
            <Layouts.Margin right="3">
              <DetailColumnItem label={t(`${I18N_PATH}Service`)} textTransform="uppercase">
                {subscriptionOrder.billableService.description}
              </DetailColumnItem>
            </Layouts.Margin>
          </Layouts.Box>
          <Layouts.Box>
            <Layouts.Margin left="5">
              <DetailColumnItem label={t(`${I18N_PATH}Material`)} textTransform="uppercase">
                {subscriptionOrder.subscriptionServiceItem.material?.description}
              </DetailColumnItem>
            </Layouts.Margin>
          </Layouts.Box>
        </Layouts.Flex>
        {subscriptionOrder.oneTime && !isWorkOrderView ? (
          <TotalBlock price={price} quantity={quantity} />
        ) : null}
      </Layouts.Flex>
    </Layouts.Margin>
  );
};

export default observer(ServiceDetails);
