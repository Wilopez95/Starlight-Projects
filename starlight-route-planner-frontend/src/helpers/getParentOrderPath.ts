import { Paths } from '@root/consts';
import { IWorkOrderMapItem } from '@root/stores/workOrderMapItem/types';
import { IWorkOrder } from '@root/types';

import { pathToUrl } from './pathToUrl';

export const getParentOrderPath = (
  workOrder: IWorkOrder | IWorkOrderMapItem,
  businessUnitId: number,
) => {
  const { subscriptionId, customerId, isIndependent } = workOrder;

  if (!businessUnitId) {
    return undefined;
  }

  if (isIndependent) {
    return pathToUrl(Paths.OrderModule.Orders, {
      businessUnit: businessUnitId,
      subPath: 'inProgress',
    });
  }

  if (!subscriptionId || !customerId) {
    return undefined;
  }

  return pathToUrl(Paths.CustomerSubscriptionModule.Orders, {
    businessUnit: businessUnitId,
    customerId,
    tab: 'active',
    id: subscriptionId,
  });
};
