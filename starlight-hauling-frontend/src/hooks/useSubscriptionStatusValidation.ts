import { useEffect } from 'react';
import { useHistory, useParams } from 'react-router';

import { Paths, SubscriptionTabRoutes } from '@root/consts';
import { pathToUrl } from '@root/helpers';

import { useBusinessContext } from './useBusinessContext/useBusinessContext';

const routesParams = [
  SubscriptionTabRoutes.Draft,
  SubscriptionTabRoutes.Active,
  SubscriptionTabRoutes.OnHold,
  SubscriptionTabRoutes.Closed,
];

export const useSubscriptionStatusValidation = (mine = false) => {
  const params = useParams<{ tab?: string }>();
  const { businessUnitId } = useBusinessContext();
  const history = useHistory();

  return useEffect(() => {
    if (!routesParams.includes(params.tab as SubscriptionTabRoutes)) {
      const path = pathToUrl(
        mine ? Paths.SubscriptionModule.MySubscriptions : Paths.SubscriptionModule.Subscriptions,
        {
          businessUnit: businessUnitId,
          tab: SubscriptionTabRoutes.Active,
        },
      );

      history.replace(path);
    }
  }, [businessUnitId, history, mine, params.tab]);
};
