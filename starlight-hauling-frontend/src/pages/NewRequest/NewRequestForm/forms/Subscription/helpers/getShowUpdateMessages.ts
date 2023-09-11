import { BillableItemActionEnum } from '@root/consts';
import {
  IGetShowUpdateMessagesParams,
  IShowUpdateMessages,
} from '@root/pages/NewRequest/NewRequestForm/forms/Subscription/types';

import { checkIfUpdatedServiceItem } from './checkIfUpdatedServiceItem';
import { checkIfUpdatedAnyServiceLineItem } from './checkIfUpdatedServiceLineItems';

export const getShowUpdateMessages = ({
  service,
  initialService,
  isSubscriptionEdit,
}: IGetShowUpdateMessagesParams): IShowUpdateMessages => {
  if (!isSubscriptionEdit) {
    return {
      isShowAddDeliveryOrderMessage: false,
      isShowAddFinalOrderMessage: false,
      showEffectiveDate: false,
    };
  }

  const isUpdatedServiceItem = checkIfUpdatedServiceItem(service, initialService);

  const isUpdatedLineItem = checkIfUpdatedAnyServiceLineItem(service, initialService);

  const isShowAddDeliveryOrderMessage = !!service.optionalSubscriptionOrders.find(
    optionalSubscriptionOrder =>
      optionalSubscriptionOrder.action === BillableItemActionEnum.delivery,
  );

  const isShowAddFinalOrderMessage = !!service.optionalSubscriptionOrders.find(
    optionalSubscriptionOrder => optionalSubscriptionOrder.action === BillableItemActionEnum.final,
  );

  const showEffectiveDate: boolean = isUpdatedLineItem || isUpdatedServiceItem;

  return {
    isShowAddDeliveryOrderMessage,
    isShowAddFinalOrderMessage,
    showEffectiveDate,
  };
};
