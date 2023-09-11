import { useCallback } from 'react';

import { IOrderRatesCalculateRequest, OrderService } from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';

export const useCalcLineItemRate = () => {
  const { businessUnitId } = useBusinessContext();
  const { lineItemStore } = useStores();
  const calcLineItemRates = useCallback(
    async ({
      lineItemId,
      serviceMaterialId,
      customRatesGroupId,
      businessLineId,
      materialId,
    }: {
      lineItemId: number;
      serviceMaterialId: number | undefined;
      customRatesGroupId: number | undefined;
      businessLineId: number;
      materialId?: number | null;
    }) => {
      const billableLineItem = lineItemStore.getById(lineItemId);

      const payload: IOrderRatesCalculateRequest = {
        businessUnitId: +businessUnitId,
        businessLineId,
        type: customRatesGroupId ? 'custom' : 'global',
        billableLineItems: [
          {
            lineItemId,
            materialId: billableLineItem?.materialBasedPricing
              ? materialId ?? serviceMaterialId
              : undefined,
          },
        ],
        customRatesGroupId,
      };

      try {
        if (
          !billableLineItem?.materialBasedPricing ||
          (billableLineItem.materialBasedPricing && (materialId || serviceMaterialId))
        ) {
          const rates = await OrderService.calculateRates(payload);

          if (rates) {
            const global = rates.globalRates;
            const custom = rates.customRates;

            const globalRate = global?.globalRatesLineItems?.find(
              globalRateElement => globalRateElement.lineItemId === lineItemId,
            );
            const customRate = custom?.customRatesLineItems?.find(
              customRateElement => customRateElement.lineItemId === lineItemId,
            );

            return {
              price: customRate?.price ?? globalRate?.price,
              customRatesGroupLineItemsId: customRate?.id,
              globalRatesLineItemsId: globalRate?.id,
            };
          }
        } else {
          return { price: undefined };
        }
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('calculateLineItemRates', typedError.response.code as ActionCode);
      }

      return { price: undefined };
    },
    [businessUnitId, lineItemStore],
  );

  return { calcLineItemRates };
};
