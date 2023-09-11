import { formatTime } from '@root/helpers';
import { IOrderLineItem } from '@root/pages/NewRequest/NewRequestForm/forms/Order/types';
import { INewRecurrentOrder } from '@root/pages/NewRequest/NewRequestForm/forms/RecurrentOrder/types';

export const mapNewRecurrentOrderRequest = (orderData: INewRecurrentOrder) => {
  const mapLineItems = (lineItems: IOrderLineItem[]) => {
    return lineItems.length
      ? lineItems.map(lineItem => ({
          ...lineItem,
          units: undefined,
        }))
      : undefined;
  };

  return {
    ...orderData,
    recurrentTemplateData: {
      ...orderData.recurrentTemplateData,
      ...formatTime(orderData.recurrentTemplateData),
      lineItems: mapLineItems(orderData.recurrentTemplateData.lineItems),
    },
    delivery: orderData.delivery
      ? {
          ...orderData.delivery,
          ...formatTime(orderData.delivery),
          lineItems: mapLineItems(orderData.delivery.lineItems),
        }
      : undefined,
    final: orderData.final
      ? {
          ...orderData.final,
          ...formatTime(orderData.final),
          lineItems: mapLineItems(orderData.final.lineItems),
        }
      : undefined,
  };
};
