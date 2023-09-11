import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { matchPath } from 'react-router-dom';

import { ClientRequestType, Paths } from '@root/consts';

import { SubscriptionOrderType } from './types';

const getOrderTypeFromPathname = (pathname: string): SubscriptionOrderType => {
  const subscriptionOrderMatch = matchPath(pathname, {
    path: Paths.RequestModule.SubscriptionOrder.Create,
  });

  if (subscriptionOrderMatch) {
    return ClientRequestType.SubscriptionOrder;
  }

  const subscriptionNonServiceMatch = matchPath(pathname, {
    path: Paths.RequestModule.SubscriptionNonService.Create,
  });

  if (subscriptionNonServiceMatch) {
    return ClientRequestType.SubscriptionNonService;
  }

  return null;
};

export const useSubscriptionOrderTypeFromParams = (): SubscriptionOrderType => {
  const location = useLocation();
  const history = useHistory();

  const [subscriptionOrderType, setSubscriptionOrderType] = useState<SubscriptionOrderType>(null);

  useEffect(
    () => setSubscriptionOrderType(getOrderTypeFromPathname(location.pathname)),
    [location, setSubscriptionOrderType],
  );

  useEffect(
    () =>
      history.listen(newHistory =>
        setSubscriptionOrderType(getOrderTypeFromPathname(newHistory.pathname)),
      ),
    [history, setSubscriptionOrderType],
  );

  return subscriptionOrderType;
};
