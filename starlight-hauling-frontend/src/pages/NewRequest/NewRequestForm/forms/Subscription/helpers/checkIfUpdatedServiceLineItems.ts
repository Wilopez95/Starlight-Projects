import { find, isEqual, pick } from 'lodash-es';

import { editableLineItemProps } from '../formikData';
import { INewSubscriptionLineItem, INewSubscriptionService } from '../types';

export const checkIfUpdatedServiceLineItem = (
  lineItem: INewSubscriptionLineItem,
  initialService?: INewSubscriptionService,
) => {
  const initialLineItem = find(initialService?.lineItems, { id: lineItem.id });

  return !isEqual(
    pick(initialLineItem, editableLineItemProps),
    pick(lineItem, editableLineItemProps),
  );
};

export const checkIfUpdatedAnyServiceLineItem = (
  service: INewSubscriptionService,
  initialService?: INewSubscriptionService,
) => service.lineItems.some(lineItem => checkIfUpdatedServiceLineItem(lineItem, initialService));
