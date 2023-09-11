import { pick } from 'lodash-es';

import { shallowDiff } from '@root/helpers/shallowDiff';
import { INewSubscription } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

import { getServiceItemsChanges } from './getServiceItemsChanges';
import { IGetSubscriptionChangesOptions, ISubscriptionChanges } from './types';

export const getSubscriptionChanges = (
  initialSubscription: INewSubscription,
  subscription: INewSubscription,
  options: IGetSubscriptionChangesOptions,
): ISubscriptionChanges => {
  const changedProps: Omit<
    Partial<INewSubscription>,
    'serviceItems'
  > = !options.skipComparisonSubscriptionProps
    ? shallowDiff(
        pick(initialSubscription, options.editableSubscriptionProps),
        pick(subscription, options.editableSubscriptionProps),
      )
    : {};

  const serviceItemsChanges = getServiceItemsChanges(
    initialSubscription.serviceItems,
    subscription.serviceItems,
    options,
  );

  return {
    ...changedProps,
    ...(serviceItemsChanges.length && { serviceItems: serviceItemsChanges }),
  };
};
