import { useMemo } from 'react';
import { useFormikContext } from 'formik';

import {
  IConfigurableSubscriptionOrder,
  ISubscriptionOrderCalculatePayload,
  ISubscriptionOrderCalculatePricePayload,
  ISubscriptionOrderCalculatePriceResponse,
  ISubscriptionOrderLineItemCalculatePayload,
} from '@root/types';

import { useBusinessContext } from '../../useBusinessContext/useBusinessContext';

import { useCalculateSubscriptionOrderPrices } from './useCalculateSubscriptionOrderPrices';

export const useSubscriptionOrderFormPrices =
  (): ISubscriptionOrderCalculatePriceResponse | null => {
    const { businessUnitId } = useBusinessContext();

    const {
      values: {
        id: subscriptionOrderId,
        businessLineId,
        jobSiteId = null,
        customRatesGroupId,
        serviceDate,
        billableServiceId = null,
        price = null,
        quantity,
        unlockOverrides = false,
        lineItems,
        materialId,
        customerId,
        applySurcharges,
      },
    } = useFormikContext<IConfigurableSubscriptionOrder>();

    const payload: ISubscriptionOrderCalculatePricePayload | null = useMemo(() => {
      if (businessLineId && quantity) {
        const orderDetails: ISubscriptionOrderCalculatePayload = {
          subscriptionOrderId,
          billableServiceId,
          price,
          quantity,
          unlockOverrides,
          materialId,
          applySurcharges,
          lineItems: lineItems.map(
            ({
              id: lineItemId,
              billableLineItemId,
              materialId: materialIdInfo,
              price: priceInfo,
              quantity: quantityInfo,
              unlockOverrides: unlockOverridesInfo,
            }): ISubscriptionOrderLineItemCalculatePayload => ({
              lineItemId,
              billableLineItemId,
              materialId: materialIdInfo ?? null,
              price: priceInfo ?? null,
              quantity: quantityInfo,
              unlockOverrides: unlockOverridesInfo,
            }),
          ),
        };

        return {
          businessUnitId: +businessUnitId,
          businessLineId,
          customRatesGroupId: customRatesGroupId ?? null,
          serviceDate,
          jobSiteId,
          customerId,
          subscriptionOrder: orderDetails,
        };
      }

      return null;
    }, [
      applySurcharges,
      billableServiceId,
      businessLineId,
      businessUnitId,
      customRatesGroupId,
      jobSiteId,
      lineItems,
      materialId,
      price,
      quantity,
      serviceDate,
      subscriptionOrderId,
      unlockOverrides,
      customerId,
    ]);

    return useCalculateSubscriptionOrderPrices(payload);
  };
