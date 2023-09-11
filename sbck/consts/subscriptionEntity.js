export const SubChildEntity = {
  SERVICE_ITEM: 'SERVICE_ITEM',
  LINE_ITEM: 'LINE_ITEM',
  SUBSCRIPTION_ORDER_SERVICE: 'SUBSCRIPTION_ORDER_SERVICE',
  SUBSCRIPTION_ORDER_SERVICE_LINE_ITEM: 'SUBSCRIPTION_ORDER_SERVICE_LINE_ITEM',
  SUBSCRIPTION_ORDER: 'SUBSCRIPTION_ORDER',
  SUBSCRIPTION_ORDER_LINE_ITEM: 'SUBSCRIPTION_ORDER_LINE_ITEM',
  SUBSCRIPTION_ORDER_NON_SERVICE: 'SUBSCRIPTION_ORDER_NON_SERVICE',
  SUBSCRIPTION_ORDER_NON_SERVICE_LINE_ITEM: 'SUBSCRIPTION_ORDER_NON_SERVICE_LINE_ITEM',
};

export const DefaultServiceEntity = {
  serviceItemId: 0,
  serviceName: 'not a service',
  serviceItems: [
    {
      id: 0,
      type: 'SERVICE_ITEM',
      price: 0,
      periodTo: '',
      quantity: 0,
      totalDay: 0,
      usageDay: 0,
      grandTotal: 0,
      totalPrice: 0,
      periodSince: '',
      subscriptionOrders: [],
    },
  ],
  lineItems: [],
  nonServiceOrder: [],
};
