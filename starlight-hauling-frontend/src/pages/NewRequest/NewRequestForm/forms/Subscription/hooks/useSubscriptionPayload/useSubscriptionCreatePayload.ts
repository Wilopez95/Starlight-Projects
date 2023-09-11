import { useCallback } from 'react';
import { omit } from 'lodash-es';

import { useBusinessContext, useStores } from '@hooks';

import { INewSubscription } from '../../types';

export const useSubscriptionCreatePayload = () => {
  const { jobSiteStore, customerStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const jobSiteId = jobSiteStore.selectedEntity?.id;
  const customerId = customerStore.selectedEntity?.id;

  return useCallback(
    (values: INewSubscription) => {
      if (!jobSiteId || !customerId) {
        return null;
      }

      return {
        ...omit(values, 'annualReminderConfig'),
        id: 0, // override subscription draft id
        orderContactId:
          values.orderContactId === 0 ? values.jobSiteContactId : values.orderContactId,
        customRatesGroupId: values.customRatesGroupId === 0 ? undefined : values.customRatesGroupId,
        driverInstructions: `${values.driverInstructions ?? ''}`,
        businessUnitId,
        customerId,
        jobSiteId,
        grandTotal: values.grandTotal,
        recurringGrandTotal: values.recurringGrandTotal,
        periodFrom: values.periodFrom,
        periodTo: values.periodTo,
        serviceItems: values.serviceItems.map(serviceItem => ({
          ...omit(serviceItem, ['billableService']),
        })),
      };
    },
    [jobSiteId, customerId, businessUnitId],
  );
};
