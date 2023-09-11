import { useMemo } from 'react';
import { useFormikContext } from 'formik';

import { useStores } from '@root/hooks/useStores';
import { INewSubscriptionOrders } from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { mapNewSubscriptionOrderRequest } from '@root/stores/subscriptionOrder/sanitize';
import {
  ISubscriptionOrderCalculatePayload,
  ISubscriptionOrderCalculatePricePayload,
  ISubscriptionOrderCalculatePriceResponse,
  ISubscriptionOrderLineItemCalculatePayload,
} from '@root/types';

import { useBusinessContext } from '../../useBusinessContext/useBusinessContext';

import { useCalculateSubscriptionOrderPrices } from './useCalculateSubscriptionOrderPrices';

export const useLinkSubscriptionOrderFormPrices = (
  isSubscriptionOrderType: boolean,
): ISubscriptionOrderCalculatePriceResponse | null => {
  const { businessUnitId } = useBusinessContext();
  const { i18nStore } = useStores();

  const { values } = useFormikContext<INewSubscriptionOrders>();

  const { businessLineId, jobSiteId = null } = values;

  const [configurableOrder] = isSubscriptionOrderType
    ? mapNewSubscriptionOrderRequest(values, i18nStore.region)
    : [null];

  const payload: ISubscriptionOrderCalculatePricePayload | null = useMemo(() => {
    if (businessLineId && configurableOrder?.quantity && isSubscriptionOrderType) {
      const {
        billableServiceId = null,
        price = null,
        quantity,
        lineItems,
        unlockOverrides = false,
        customRatesGroupId,
        serviceDate,
        materialId,
        applySurcharges,
      } = configurableOrder;

      const orderDetails: ISubscriptionOrderCalculatePayload = {
        subscriptionOrderId: null,
        billableServiceId,
        price,
        quantity,
        unlockOverrides,
        materialId,
        applySurcharges,
        lineItems: lineItems.map(
          ({
            billableLineItemId,
            materialId: materialIdData,
            price: priceData,
            quantity: quantityData,
            unlockOverrides: unlockOverridesData,
            historicalLineItem,
          }): ISubscriptionOrderLineItemCalculatePayload => ({
            lineItemId: historicalLineItem?.originalId ?? null,
            billableLineItemId,
            materialId: materialIdData ?? null,
            price: priceData ?? null,
            quantity: quantityData,
            unlockOverrides: unlockOverridesData,
          }),
        ),
      };

      return {
        businessUnitId: +businessUnitId,
        businessLineId: +businessLineId,
        customRatesGroupId: customRatesGroupId ?? null,
        serviceDate,
        jobSiteId,
        subscriptionOrder: orderDetails,
      };
    }

    return null;
    /* eslint-disable */
  }, [businessLineId, businessUnitId, isSubscriptionOrderType, jobSiteId]);

  return useCalculateSubscriptionOrderPrices(payload);
};
