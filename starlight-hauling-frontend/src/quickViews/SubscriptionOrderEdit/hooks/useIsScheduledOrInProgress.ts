import { useStores } from '@root/hooks';
import { SubscriptionOrderStatusEnum } from '@root/types';

export const useIsScheduledOrInProgress = (): boolean => {
  const { subscriptionOrderStore } = useStores();
  const subscriptionOrder = subscriptionOrderStore.selectedEntity;

  return !!(
    subscriptionOrder &&
    [SubscriptionOrderStatusEnum.scheduled, SubscriptionOrderStatusEnum.inProgress].includes(
      subscriptionOrder.status,
    )
  );
};
