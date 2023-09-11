import React, { useEffect } from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { useStores } from '@root/hooks';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

import JobSiteDetails from '../../../SubscriptionOrderQuickView/components/sections/JobSiteDetails/JobSiteDetails';
import Notes from '../../../SubscriptionOrderQuickView/components/sections/Notes/Notes';
import ServiceDetails from '../../../SubscriptionOrderQuickView/components/sections/ServiceDetails/ServiceDetails';
import SubscriptionServicingOrderDetails from '../../../SubscriptionOrderQuickView/components/sections/SubscriptionServicingOrderDetails/SubscriptionServicingOrderDetails';
import SubscriptionWorkOrderDetails from '../../../SubscriptionOrderQuickView/components/sections/SubscriptionWorkOrderDetails/SubscriptionWorkOrderDetails';
import WorkOrderLineItems from '../WorkOrderLineItems/WorkOrderLineItems';
import WorkOrderRecurringLineItems from '../WorkOrderRecurringLineItems/WorkOrderRecurringLineItems';

const WorkOrderMainInformation: React.FC<{
  subscription: Subscription;
  subscriptionOrder: SubscriptionOrder;
}> = ({ subscription, subscriptionOrder }) => {
  const { subscriptionStore } = useStores();

  useEffect(() => {
    subscriptionStore.requestSubscriptionServices(subscription.id);
  }, [subscriptionStore, subscription.id]);
  const { oneTime } = subscriptionOrder;

  return (
    <Layouts.Padding top="1">
      <SubscriptionWorkOrderDetails oneTime={oneTime} />
      <Notes isWorkOrderView />
      <JobSiteDetails isWorkOrderView />
      {oneTime ? (
        <ServiceDetails
          subscription={subscription}
          subscriptionOrder={subscriptionOrder}
          isWorkOrderView
        />
      ) : (
        <>
          <SubscriptionServicingOrderDetails
            subscriptionOrder={subscriptionOrder}
            serviceFrequencyAggregated={subscription.serviceFrequencyAggregated}
            isWorkOrderView
          />
          <WorkOrderRecurringLineItems
            subscriptionId={subscription.id}
            subscriptionServiceItemId={subscriptionOrder.subscriptionServiceItemId}
            isWorkOrderView
            oneTime
          />
        </>
      )}
      <WorkOrderLineItems />
    </Layouts.Padding>
  );
};

export default observer(WorkOrderMainInformation);
