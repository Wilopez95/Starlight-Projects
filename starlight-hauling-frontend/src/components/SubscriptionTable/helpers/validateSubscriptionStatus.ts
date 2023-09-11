import { SubscriptionTabRoutes } from '@root/consts';

const routesParams = [
  SubscriptionTabRoutes.Draft,
  SubscriptionTabRoutes.Active,
  SubscriptionTabRoutes.OnHold,
  SubscriptionTabRoutes.Closed,
];

export const validateSubscriptionStatus = (status: SubscriptionTabRoutes) => {
  return routesParams.includes(status);
};
