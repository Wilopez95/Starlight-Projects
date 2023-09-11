import React from 'react';
import { observer } from 'mobx-react-lite';

import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

import RecurringLineItems from '../RecurringLineItems/RecurringLineItems';
import ServicingDetails from '../SubscriptionServicingOrderDetails/SubscriptionServicingOrderDetails';

const RecurringServicesBlock: React.FC<{
  subscription: Subscription;
  subscriptionOrder: SubscriptionOrder;
  isWorkOrderView?: boolean;
  oneTime?: boolean;
}> = ({ subscription, subscriptionOrder, oneTime = false }) => {
  return (
    <>
      <ServicingDetails
        subscriptionOrder={subscriptionOrder}
        serviceFrequencyAggregated={subscription.serviceFrequencyAggregated}
      />
      <RecurringLineItems
        subscriptionId={subscription.id}
        subscriptionServiceItemId={subscriptionOrder.subscriptionServiceItemId}
        oneTime={oneTime}
      />
    </>
  );
};

export default observer(RecurringServicesBlock);
