import { useCallback } from 'react';
import { omit } from 'lodash-es';

import { IConfigurableSubscription, ISubscription, ISubscriptionDraft } from '@root/types';

import { generateSubscriptionUpdateEvents } from '../../helpers/generateSubscriptionUpdateEvents';
import { INewSubscription } from '../../types';

import { useSubscriptionCreatePayload } from './useSubscriptionCreatePayload';

export const useSubscriptionUpdatePayload = (initialValues: INewSubscription) => {
  const getBasePayload = useSubscriptionCreatePayload();

  return useCallback(
    (
      values: INewSubscription,
      subscription: ISubscription | ISubscriptionDraft,
    ): IConfigurableSubscription | null => {
      const basePayload = getBasePayload(values);

      if (!basePayload) {
        return null;
      }

      const { serviceItems, lineItems, subscriptionOrders } = generateSubscriptionUpdateEvents({
        values,
        initialValues,
      });

      return {
        id: subscription.id,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        customerId: subscription.customer.id,
        jobSiteContactId: basePayload.jobSiteContactId,
        jobSiteContactTextOnly: subscription.jobSiteContactTextOnly,
        driverInstructions: basePayload.driverInstructions ?? null,
        purchaseOrderId: basePayload.purchaseOrderId,
        permitId: basePayload.permitId ?? null,
        bestTimeToComeFrom: basePayload.bestTimeToComeFrom,
        bestTimeToComeTo: basePayload.bestTimeToComeTo,
        someoneOnSite: basePayload.someoneOnSite,
        highPriority: basePayload.highPriority,
        thirdPartyHaulerId: basePayload.thirdPartyHaulerId ?? null,
        subscriptionContactId: basePayload.orderContactId || basePayload.jobSiteContactId,
        startDate: basePayload.startDate!,
        endDate: basePayload.endDate ?? null,
        unlockOverrides: values.unlockOverrides,
        promoId: basePayload.promoId ?? null,
        onHold: values.onHold,
        offHold: values.offHold,
        reason: values.reason,
        customRatesGroupId: values?.customRatesGroupId ?? null,
        reasonDescription: values.reasonDescription,
        holdSubscriptionUntil: values.holdSubscriptionUntil,
        overrideCreditLimit: values.overrideCreditLimit,
        grandTotal: values.grandTotal,
        recurringGrandTotal: values.recurringGrandTotal,
        periodFrom: values.periodFrom,
        periodTo: values.periodTo,
        csrComment: values.csrComment ?? null,
        ...(!!serviceItems.length && {
          serviceItems: serviceItems.map(serviceItem => ({
            ...omit(serviceItem, ['billableService']),
          })),
        }),
        ...(!!lineItems.length && {
          lineItems,
        }),
        ...(!!subscriptionOrders.length && {
          subscriptionOrders: subscriptionOrders.map(subscriptionOrder => ({
            ...omit(subscriptionOrder, ['subscriptionOrderOptions']),
          })),
        }),
      };
    },
    [getBasePayload, initialValues],
  );
};
