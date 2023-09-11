import * as Yup from 'yup';

import { ClientRequestType } from '@root/consts';
import { notNullObject } from '@root/helpers';

import { ILinkSubscriptionOrderData, LinkRequest } from './types';

export const validationSchema = Yup.object().shape({
  requestType: Yup.string().oneOf(LinkRequest).required('Request Type is required'),
  subscriptionId: Yup.number().required('Subscription is required'),
});

const defaultValue: ILinkSubscriptionOrderData = {
  requestType: ClientRequestType.SubscriptionOrder,
  subscriptionId: undefined,
};

export const getValues = (item?: ILinkSubscriptionOrderData): ILinkSubscriptionOrderData => {
  if (!item) {
    return defaultValue;
  }

  return notNullObject(item, defaultValue);
};
