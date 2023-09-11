import { isEmpty } from 'lodash-es';

import { IReviewProration } from '@root/types';

import { IReviewProrationFormData } from '../types';

export const sanitizePayload = (
  { serviceItems, ...values }: IReviewProrationFormData,
  initialValues: IReviewProrationFormData,
): IReviewProration => ({
  ...values,
  serviceItems: serviceItems.map(({ lineItems, ...data }, serviceItemIndex) => ({
    ...data,
    billableServiceId: data.billableServiceId,
    prorationOverride: data.price !== initialValues.serviceItems[serviceItemIndex].price,
    lineItems: isEmpty(lineItems)
      ? undefined
      : lineItems.map((lineItem, lineItemIndex) => ({
          ...lineItem,
          billableLineItemId: lineItem.billableLineItemId,
          prorationOverride:
            lineItem.price !==
            initialValues.serviceItems[serviceItemIndex].lineItems[lineItemIndex].price,
        })),
  })),
});
