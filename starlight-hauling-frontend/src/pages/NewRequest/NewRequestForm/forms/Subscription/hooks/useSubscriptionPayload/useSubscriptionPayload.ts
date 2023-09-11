import { INewSubscription } from '../../types';

import { useSubscriptionCreatePayload } from './useSubscriptionCreatePayload';
import { useSubscriptionDraftUpdatePayload } from './useSubscriptionDraftUpdatePayload';
import { useSubscriptionUpdatePayload } from './useSubscriptionUpdatePayload';

export const useSubscriptionPayload = (initialValues: INewSubscription) => {
  const getSubscriptionCreatePayload = useSubscriptionCreatePayload();
  const getSubscriptionUpdatePayload = useSubscriptionUpdatePayload(initialValues);
  const getSubscriptionDraftUpdatePayload = useSubscriptionDraftUpdatePayload(initialValues);

  return {
    getSubscriptionCreatePayload,
    getSubscriptionUpdatePayload,
    getSubscriptionDraftUpdatePayload,
    getSubscriptionDraftCreatePayload: getSubscriptionCreatePayload,
  };
};
