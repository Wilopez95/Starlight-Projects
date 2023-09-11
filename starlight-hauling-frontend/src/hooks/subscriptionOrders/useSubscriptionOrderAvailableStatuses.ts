import { SubscriptionOrderStatusEnum } from '@root/types';

import { usePermission } from '../permissions/usePermission';

export const useSubscriptionOrderAvailableStatuses = (): SubscriptionOrderStatusEnum[] => {
  const viewScheduled = usePermission([
    'orders/subscription-orders:scheduled:perform',
    'subscriptions:own:full-access',
    'subscriptions:all:full-access',
  ]);
  const viewInProgress = usePermission([
    'orders/subscription-orders:in-progress:perform',
    'subscriptions:own:full-access',
    'subscriptions:all:full-access',
  ]);
  const viewCompleted = usePermission([
    'orders/subscription-orders:completed:perform',
    'subscriptions:own:full-access',
    'subscriptions:all:full-access',
  ]);
  const viewApproved = usePermission([
    'orders/subscription-orders:approved:perform',
    'subscriptions:own:full-access',
    'subscriptions:all:full-access',
  ]);
  const viewFinalized = usePermission([
    'orders/subscription-orders:finalized:perform',
    'subscriptions:own:full-access',
    'subscriptions:all:full-access',
  ]);
  const viewInvoiced = usePermission([
    'orders/subscription-orders:invoiced:perform',
    'subscriptions:own:full-access',
    'subscriptions:all:full-access',
  ]);

  const availableStatuses: SubscriptionOrderStatusEnum[] = [];

  if (viewScheduled) {
    availableStatuses.push(SubscriptionOrderStatusEnum.scheduled);
  }

  if (viewInProgress) {
    availableStatuses.push(SubscriptionOrderStatusEnum.inProgress);
  }

  if (viewCompleted) {
    availableStatuses.push(SubscriptionOrderStatusEnum.completed);
  }

  if (viewApproved) {
    availableStatuses.push(SubscriptionOrderStatusEnum.approved);
  }

  if (viewFinalized) {
    availableStatuses.push(SubscriptionOrderStatusEnum.finalized);
  }

  if (viewInvoiced) {
    availableStatuses.push(SubscriptionOrderStatusEnum.invoiced);
  }

  return availableStatuses;
};
