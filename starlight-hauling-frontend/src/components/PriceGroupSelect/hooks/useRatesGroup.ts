import { useEffect, useMemo, useState } from 'react';

import {
  IOrderSelectCustomRatesResponse,
  IOrderSelectGlobalRatesResponse,
  OrderService,
} from '@root/api';
import { NotificationHelper } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';

export const useRatesGroup = () => {
  const { businessUnitId } = useBusinessContext();
  const { subscriptionStore } = useStores();
  const intlConfig = useIntl();
  const [selectedGroup, setSelectedGroup] = useState<
    IOrderSelectCustomRatesResponse | IOrderSelectGlobalRatesResponse | null
  >(null);

  const subscription = subscriptionStore.selectedEntity;

  const requestOptions = useMemo(
    () =>
      subscription && {
        businessUnitId,
        businessLineId: subscription.businessLine.id.toString(),
        customerId: subscription.customer?.originalId,
        serviceAreaId: subscription.serviceArea?.originalId,
        customerJobSiteId: subscription.customerJobSite?.originalId ?? null,
        date: subscription.startDate,
      },
    [businessUnitId, subscription],
  );

  useEffect(() => {
    (async () => {
      if (requestOptions) {
        try {
          const response = await OrderService.selectRatesGroup(requestOptions);

          setSelectedGroup(response);
        } catch (error) {
          setSelectedGroup(null);
          NotificationHelper.error('default');
        }
      }
    })();
  }, [intlConfig, requestOptions]);

  return selectedGroup;
};
