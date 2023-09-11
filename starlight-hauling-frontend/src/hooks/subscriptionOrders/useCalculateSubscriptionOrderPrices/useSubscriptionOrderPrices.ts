import { useMemo } from 'react';

import {
  ISubscriptionOrder,
  ISubscriptionOrderCalculatePayload,
  ISubscriptionOrderCalculatePricePayload,
  ISubscriptionOrderCalculatePriceResponse,
  ISubscriptionOrderLineItemCalculatePayload,
} from '@root/types';

import { useBusinessContext } from '../../useBusinessContext/useBusinessContext';

import { useCalculateSubscriptionOrderPrices } from './useCalculateSubscriptionOrderPrices';

export const useSubscriptionOrderPrices = (
  subscriptionOrder: ISubscriptionOrder | null,
): ISubscriptionOrderCalculatePriceResponse | null => {
  const { businessUnitId } = useBusinessContext();

  const payload: ISubscriptionOrderCalculatePricePayload | null = useMemo(() => {
    if (!subscriptionOrder) {
      return null;
    }

    const {
      id: subscriptionOrderId,
      businessLine,
      customRatesGroupId,
      serviceDate,
      jobSite,
      billableService,
      price,
      quantity,
      unlockOverrides,
      lineItems,
      material,
      customer,
    } = subscriptionOrder;

    if (!(businessLine?.id && jobSite?.originalId && jobSite.id)) {
      return null;
    }

    const orderDetails: ISubscriptionOrderCalculatePayload = {
      subscriptionOrderId,
      billableServiceId: billableService.originalId,
      price,
      quantity,
      unlockOverrides,
      materialId: material?.originalId ?? material?.id,
      lineItems: lineItems.map(
        ({
          id: lineItemId,
          billableLineItemId,
          materialId,
          price: priceLineItem,
          quantity: quantityLineItem,
          unlockOverrides: unlockOverridesLineItem,
        }): ISubscriptionOrderLineItemCalculatePayload => ({
          lineItemId,
          billableLineItemId,
          materialId: materialId ?? null,
          price: priceLineItem ?? null,
          quantity: quantityLineItem,
          unlockOverrides: unlockOverridesLineItem,
        }),
      ),
      applySurcharges: subscriptionOrder.applySurcharges,
    };

    return {
      businessUnitId: +businessUnitId,
      businessLineId: businessLine?.id,
      customRatesGroupId,
      serviceDate,
      jobSiteId: jobSite?.originalId,
      subscriptionOrder: orderDetails,
      customerId: customer?.id,
    };
  }, [businessUnitId, subscriptionOrder]);

  return useCalculateSubscriptionOrderPrices(payload);
};
