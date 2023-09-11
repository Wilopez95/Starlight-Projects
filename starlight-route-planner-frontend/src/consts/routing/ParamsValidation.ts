import { OrderStatusRoutes, SubscriptionTabRoutes } from './Params';

const OrderStatus = [
  OrderStatusRoutes.InProgress,
  OrderStatusRoutes.Completed,
  OrderStatusRoutes.Approved,
  OrderStatusRoutes.Finalized,
  OrderStatusRoutes.Invoiced,
];

const SubscriptionStatus = [
  SubscriptionTabRoutes.Active,
  SubscriptionTabRoutes.Closed,
  SubscriptionTabRoutes.Draft,
  SubscriptionTabRoutes.OnHold,
];

//TODO add reports validation
export const ParamsValidation = {
  OrderStatus: `(${OrderStatus.join('|')})`,
  SubscriptionStatus: `(${SubscriptionStatus.join('|')})`,
};
