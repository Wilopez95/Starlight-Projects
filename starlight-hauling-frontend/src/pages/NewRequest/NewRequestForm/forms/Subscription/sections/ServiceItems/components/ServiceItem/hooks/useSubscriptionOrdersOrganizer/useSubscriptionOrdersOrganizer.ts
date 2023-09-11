import { useCallback, useEffect } from 'react';
import { isAfter } from 'date-fns';
import { compact, find, isEqual, pick, sortBy } from 'lodash-es';

import { INewSubscriptionOrder } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { usePrevious } from '@hooks';

import { ISubscriptionOrdersOrganizer } from './types';

const sortSubscriptionOrdersByTypeAndServiceDate = (
  subscriptionOrders: INewSubscriptionOrder[],
) => {
  return sortBy(subscriptionOrders, ['isFinalForService', 'serviceDate']);
};

const removeOutsideSubscriptionOrders = (subscriptionOrders: INewSubscriptionOrder[]) => {
  const finalForServiceSubscriptionOrder = find(subscriptionOrders, {
    isFinalForService: true,
  });

  if (finalForServiceSubscriptionOrder?.serviceDate) {
    return compact(
      subscriptionOrders.map(subscriptionOrder => {
        const isSubscriptionOrderServiceDateAfterFinal =
          subscriptionOrder.serviceDate &&
          finalForServiceSubscriptionOrder.serviceDate &&
          isAfter(subscriptionOrder.serviceDate, finalForServiceSubscriptionOrder.serviceDate);

        if (isSubscriptionOrderServiceDateAfterFinal) {
          if (subscriptionOrder.id) {
            return {
              ...subscriptionOrder,
              quantity: 0,
            };
          }

          return null;
        }

        return subscriptionOrder;
      }),
    );
  }

  return subscriptionOrders;
};

export const useSubscriptionOrdersOrganizer = ({
  serviceItemSubscriptionOrders,
  updateServiceItemSubscriptionOrders,
}: ISubscriptionOrdersOrganizer) => {
  const prevServiceItemSubscriptionOrders = usePrevious(serviceItemSubscriptionOrders);

  const organize = useCallback(() => {
    updateServiceItemSubscriptionOrders({
      subscriptionOrders: removeOutsideSubscriptionOrders(
        sortSubscriptionOrdersByTypeAndServiceDate(
          serviceItemSubscriptionOrders.subscriptionOrders,
        ),
      ),
      optionalSubscriptionOrders: sortSubscriptionOrdersByTypeAndServiceDate(
        serviceItemSubscriptionOrders.optionalSubscriptionOrders,
      ),
    });
  }, [
    serviceItemSubscriptionOrders.optionalSubscriptionOrders,
    serviceItemSubscriptionOrders.subscriptionOrders,
    updateServiceItemSubscriptionOrders,
  ]);

  useEffect(() => {
    const subscriptionOrderProps: (keyof INewSubscriptionOrder)[] = ['serviceDate'];

    const subscriptionOrders = serviceItemSubscriptionOrders.subscriptionOrders?.map(item =>
      pick(item, subscriptionOrderProps),
    );
    const prevSubscriptionOrders = prevServiceItemSubscriptionOrders?.subscriptionOrders?.map(
      item => pick(item, subscriptionOrderProps),
    );

    if (!isEqual(subscriptionOrders, prevSubscriptionOrders)) {
      organize();
    }
  }, [
    prevServiceItemSubscriptionOrders?.subscriptionOrders,
    serviceItemSubscriptionOrders.subscriptionOrders,
    organize,
  ]);
};
