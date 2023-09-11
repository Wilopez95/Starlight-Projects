import React from 'react';
import { observer } from 'mobx-react-lite';

import { BillableItemActionEnum } from '@root/consts';
import { Subscription } from '@root/stores/subscription/Subscription';
import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';

import NonServiceLineItems from '../NonService/NonServiceLineItems/NonServiceLineItems';
import ServiceDetails from '../ServiceDetails/ServiceDetails';

const OneTimeServicesBlock: React.FC<{
  subscription: Subscription;
  subscriptionOrder: SubscriptionOrder;
  isWorkOrderView?: boolean;
}> = ({ subscriptionOrder, subscription }) => {
  const { billableService } = subscriptionOrder;
  const isNonService = billableService?.action === BillableItemActionEnum.nonService;

  return (
    <>
      {isNonService ? (
        <NonServiceLineItems subscriptionOrder={subscriptionOrder} />
      ) : (
        <ServiceDetails subscription={subscription} subscriptionOrder={subscriptionOrder} />
      )}
    </>
  );
};

export default observer(OneTimeServicesBlock);
