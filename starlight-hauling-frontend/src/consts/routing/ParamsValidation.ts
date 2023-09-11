import { OrderStatusRoutes, SubscriptionOrderTabRoutes, SubscriptionTabRoutes } from './Params';

const OrderStatus = [
  OrderStatusRoutes.InProgress,
  OrderStatusRoutes.Completed,
  OrderStatusRoutes.Approved,
  OrderStatusRoutes.Finalized,
  OrderStatusRoutes.Invoiced,
  OrderStatusRoutes.All,
];

const SubscriptionStatus = [
  SubscriptionTabRoutes.Active,
  SubscriptionTabRoutes.Closed,
  SubscriptionTabRoutes.Draft,
  SubscriptionTabRoutes.OnHold,
];

const SubscriptionOrderStatus = [
  SubscriptionOrderTabRoutes.scheduled,
  SubscriptionOrderTabRoutes.inProgress,
  SubscriptionOrderTabRoutes.completed,
  SubscriptionOrderTabRoutes.blocked,
  SubscriptionOrderTabRoutes.skipped,
  SubscriptionOrderTabRoutes.canceled,
  SubscriptionOrderTabRoutes.approved,
  SubscriptionOrderTabRoutes.finalized,
  SubscriptionOrderTabRoutes.invoiced,
];

//TODO add reports validation
export const ParamsValidation = {
  OrderStatus: `(${OrderStatus.join('|')})`,
  SubscriptionStatus: `(${SubscriptionStatus.join('|')})`,
  SubscriptionOrderStatus: `(${Object.values(SubscriptionOrderStatus).join('|')})`,
};
