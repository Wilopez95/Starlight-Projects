import { useCallback } from 'react';
import { showError } from '@starlightpro/common';
import { useMakeOrderCompletedMutation } from '../../../graphql/api';
import { useExceededCreditLimitPopup } from './useExceededCreditLimitPopup';

export const useCompleteOrderWithExceededCreditLimitPopup = () => {
  const [makeOrderCompleted] = useMakeOrderCompletedMutation();

  const showExceededCreditLimitPopup = useExceededCreditLimitPopup();

  return useCallback(
    async (orderId: number) => {
      try {
        await makeOrderCompleted({ variables: { id: orderId } });
      } catch (e) {
        if (e.message === 'Credit limit exceeded for on account payment') {
          await showExceededCreditLimitPopup(() =>
            makeOrderCompleted({
              variables: { id: orderId, data: { overrideCreditLimit: true } },
            }),
          );

          return;
        }
        showError(e.message);
        throw e;
      }
    },
    [makeOrderCompleted, showExceededCreditLimitPopup],
  );
};
