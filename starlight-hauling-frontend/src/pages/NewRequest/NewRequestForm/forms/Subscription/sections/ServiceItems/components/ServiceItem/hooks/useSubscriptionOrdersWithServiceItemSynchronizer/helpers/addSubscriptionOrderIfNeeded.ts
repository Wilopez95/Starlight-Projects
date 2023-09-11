import { filter, find } from 'lodash-es';

import { BillableItemActionEnum } from '@root/consts';
import { billableServiceToSelectOption, getBillableServiceIncludedServiceIds } from '@root/helpers';
import {
  INewServiceItemSubscriptionOrders,
  INewSubscriptionOrder,
  SubscriptionOrderOption,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';
import { IBillableService } from '@root/types';

const getSubscriptionOrderOptions = (
  billableServices: IBillableService[],
  serviceItemBillableService: IBillableService,
  action: BillableItemActionEnum | null,
) => {
  const subscriptionOrderOptions: SubscriptionOrderOption[] = billableServices
    .filter(
      billableService =>
        billableService.equipmentItem?.id === serviceItemBillableService?.equipmentItemId &&
        billableService.action === action,
    )
    .map(billableService => ({
      ...billableServiceToSelectOption(billableService),
      action: billableService.action,
      isIncludedInService: getBillableServiceIncludedServiceIds(
        serviceItemBillableService,
      ).includes(billableService.id),
    }));

  return subscriptionOrderOptions;
};

export const addSubscriptionOrderIfNeeded = ({
  isSubscriptionDraftEdit,
  serviceItemSubscriptionOrders,
  billableServices,
  action,
  isFinalForService = false,
  serviceItemBillableService,
}: {
  isSubscriptionDraftEdit: boolean;
  serviceItemSubscriptionOrders: INewServiceItemSubscriptionOrders;
  billableServices: IBillableService[];
  action: BillableItemActionEnum;
  isFinalForService?: boolean;
  serviceItemBillableService?: IBillableService;
}) => {
  if (!serviceItemBillableService) {
    return serviceItemSubscriptionOrders;
  }

  const options = getSubscriptionOrderOptions(billableServices, serviceItemBillableService, action);

  const includedInServiceOptions = filter(options, { isIncludedInService: true });

  const newSubscriptionOrder: INewSubscriptionOrder = {
    id: 0,
    billableServiceId:
      includedInServiceOptions.length === 1 ? Number(includedInServiceOptions[0].value) || 0 : 0,
    action,
    quantity: 1,
    globalRatesServicesId: undefined,
    customRatesGroupServicesId: undefined,
    unlockOverrides: false,
    price: 0,
    serviceDate: undefined,
    isFinalForService,
    subscriptionOrderOptions: options,
  };

  const isAlreadyAddedByUser =
    includedInServiceOptions.length === 0
      ? find(
          serviceItemSubscriptionOrders.subscriptionOrders,
          isSubscriptionDraftEdit || isFinalForService
            ? { isFinalForService }
            : {
                id: 0,
                isFinalForService: false,
              },
        )
      : true;

  const subscriptionOrdersKey = isAlreadyAddedByUser
    ? 'subscriptionOrders'
    : 'optionalSubscriptionOrders';

  const isAlreadyAddedBySystem = find(
    serviceItemSubscriptionOrders[subscriptionOrdersKey],
    isSubscriptionDraftEdit || isFinalForService
      ? { isFinalForService }
      : {
          id: 0,
          isFinalForService: false,
        },
  );

  if (isAlreadyAddedBySystem) {
    return serviceItemSubscriptionOrders;
  }

  return {
    ...serviceItemSubscriptionOrders,
    [subscriptionOrdersKey]: [
      ...serviceItemSubscriptionOrders[subscriptionOrdersKey],
      newSubscriptionOrder,
    ],
  };
};
