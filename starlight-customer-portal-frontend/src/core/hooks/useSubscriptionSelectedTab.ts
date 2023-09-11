import { useParams } from 'react-router';

import { SubscriptionTabRoutes } from '@root/core/consts';

export const useSubscriptionSelectedTab = () => {
  const params = useParams<{ tab?: string }>();

  switch (params.tab) {
    case SubscriptionTabRoutes.Draft:
      return SubscriptionTabRoutes.Draft;

    case SubscriptionTabRoutes.OnHold:
      return SubscriptionTabRoutes.OnHold;

    case SubscriptionTabRoutes.Closed:
      return SubscriptionTabRoutes.Closed;

    default:
      return SubscriptionTabRoutes.Active;
  }
};
