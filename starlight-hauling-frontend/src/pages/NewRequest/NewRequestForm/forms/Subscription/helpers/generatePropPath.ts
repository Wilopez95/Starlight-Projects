import {
  IGenerateLineItemPropPathInput,
  IGenerateServicePropPathInput,
  IGenerateSubscriptionOrderPropPath,
} from './types';

export const generateServicePropPath = ({
  serviceIndex,
  property,
}: IGenerateServicePropPathInput) => `serviceItems[${serviceIndex}].${property}`;

export const generateLineItemsPropPath = ({
  serviceIndex,
  lineItemIndex,
  property,
}: IGenerateLineItemPropPathInput) => {
  const lineItemsPath = generateServicePropPath({
    serviceIndex,
    property: `lineItems`,
  });

  return `${lineItemsPath}[${lineItemIndex}].${property}`;
};

export const generateSubscriptionOrderPropPath = ({
  serviceIndex,
  subscriptionOrderIndex,
  property,
}: IGenerateSubscriptionOrderPropPath) => {
  const subscriptionOrdersPath = generateServicePropPath({
    serviceIndex,
    property: `subscriptionOrders`,
  });

  return `${subscriptionOrdersPath}[${subscriptionOrderIndex}].${property}`;
};
