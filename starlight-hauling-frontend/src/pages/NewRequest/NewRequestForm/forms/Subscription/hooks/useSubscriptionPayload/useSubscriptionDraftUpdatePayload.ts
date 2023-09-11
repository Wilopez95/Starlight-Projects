import { useCallback } from 'react';
import { omit } from 'lodash-es';

import { IConfigurableSubscriptionDraft, ISubscriptionDraft } from '@root/types';

import { generateSubscriptionUpdateEvents } from '../../helpers/generateSubscriptionUpdateEvents';
import { INewSubscription } from '../../types';

import { useSubscriptionCreatePayload } from './useSubscriptionCreatePayload';

export const useSubscriptionDraftUpdatePayload = (initialValues: INewSubscription) => {
  const getBasePayload = useSubscriptionCreatePayload();

  return useCallback(
    (
      values: INewSubscription,
      subscription: ISubscriptionDraft,
    ): IConfigurableSubscriptionDraft | null => {
      const basePayload = getBasePayload(values);

      const { serviceItems, lineItems, subscriptionOrders } = generateSubscriptionUpdateEvents({
        values,
        initialValues,
      });

      if (basePayload) {
        return {
          id: subscription.id,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
          startDate: basePayload.startDate ?? null,
          endDate: basePayload.endDate ?? null,
          thirdPartyHaulerId: basePayload.thirdPartyHaulerId ?? null,
          purchaseOrder: basePayload?.purchaseOrder ?? null,
          permitId: basePayload?.permitId ?? null,
          minBillingPeriods: basePayload?.minBillingPeriods,
          jobSiteContactId: basePayload.jobSiteContactId,
          bestTimeToComeFrom: basePayload.bestTimeToComeFrom,
          bestTimeToComeTo: basePayload.bestTimeToComeTo,
          highPriority: basePayload.highPriority,
          poRequired: basePayload.poRequired,
          permitRequired: basePayload.permitRequired,
          signatureRequired: basePayload.signatureRequired,
          alleyPlacement: basePayload.alleyPlacement,
          someoneOnSite: basePayload.someoneOnSite,
          grandTotal: basePayload.grandTotal,
          driverInstructions: basePayload?.driverInstructions ?? null,
          jobSiteContactTextOnly: subscription.jobSiteContactTextOnly,
          subscriptionContactId: basePayload.orderContactId || basePayload.jobSiteContactId,
          unlockOverrides: basePayload.unlockOverrides,
          jobSiteNote: '',
          promoId: basePayload.promoId ?? null,
          serviceAreaId: basePayload.serviceAreaId ?? null,
          customRatesGroupId: basePayload.customRatesGroupId ?? null,
          equipmentType: basePayload.equipmentType ?? null,
          competitorId: basePayload.competitorId ?? null,
          anniversaryBilling: basePayload.anniversaryBilling,
          billingCycle: basePayload.billingCycle,
          billingType: basePayload.billingType,
          competitorExpirationDate: basePayload.competitorExpirationDate ?? null,
          ...(!!serviceItems.length && {
            serviceItems: serviceItems.map(serviceItem => omit(serviceItem, ['billableService'])),
          }),
          ...(!!lineItems.length && { lineItems }),
          ...(!!subscriptionOrders.length && { subscriptionOrders }),
        };
      }

      return null;
    },
    [getBasePayload, initialValues],
  );
};
