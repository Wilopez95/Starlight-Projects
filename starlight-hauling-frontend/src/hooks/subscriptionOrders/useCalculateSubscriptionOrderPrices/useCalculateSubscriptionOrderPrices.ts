import { useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash-es';

import { useStores } from '@root/hooks/useStores';
import {
  ISubscriptionOrderCalculatePricePayload,
  ISubscriptionOrderCalculatePriceResponse,
} from '@root/types';

export const useCalculateSubscriptionOrderPrices = (
  payload: ISubscriptionOrderCalculatePricePayload | null,
) => {
  const [prices, setPrices] = useState<ISubscriptionOrderCalculatePriceResponse | null>(null);
  const { subscriptionOrderStore } = useStores();

  const abortControllerRef = useRef<AbortController>();

  const requestPrices = useMemo(
    () =>
      debounce(async (data: ISubscriptionOrderCalculatePricePayload | null) => {
        setPrices(null);
        if (data) {
          const response = await subscriptionOrderStore.calculatePrices(
            data,
            abortControllerRef.current?.signal,
          );

          setPrices(response);
        }
      }, 500),
    [subscriptionOrderStore],
  );

  useEffect(() => {
    const abortController = new AbortController();

    abortControllerRef.current = abortController;

    requestPrices(payload);

    return () => {
      abortControllerRef.current?.abort();
      requestPrices.cancel();
    };
  }, [requestPrices, payload]);

  return prices;
};
