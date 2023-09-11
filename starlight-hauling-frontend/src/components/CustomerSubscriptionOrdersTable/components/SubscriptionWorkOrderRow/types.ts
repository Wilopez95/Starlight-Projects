import { SubscriptionOrder } from '@root/stores/subscriptionOrder/SubscriptionOrder';
import { SubscriptionWorkOrder } from '@root/stores/subscriptionWorkOrder/SubscriptionWorkOrder';

export interface ISubscriptionWorkOrderRow {
  subscriptionWorkOrder: SubscriptionWorkOrder;
  subscriptionOrder: SubscriptionOrder;
}
