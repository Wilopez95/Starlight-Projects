export const getNestedEntitiesIds = serviceItems => {
  const materialsIds = [];
  const billableServicesIds = [];
  const billableLineItemsIds = [];
  for (const serviceItem of serviceItems) {
    if (serviceItem.materialId) {
      materialsIds.push(serviceItem.materialId);
    }
    if (serviceItem.billableServiceId) {
      billableServicesIds.push(serviceItem.billableServiceId);
    }
    if (serviceItem.subscriptionOrders?.length) {
      for (const subscriptionOrder of serviceItem.subscriptionOrders) {
        if (subscriptionOrder.billableServiceId) {
          billableServicesIds.push(subscriptionOrder.billableServiceId);
        }
        if (subscriptionOrder.lineItems?.length) {
          for (const oneTimeLineItem of subscriptionOrder.lineItems) {
            if (oneTimeLineItem.billableLineItemId) {
              billableLineItemsIds.push(oneTimeLineItem.billableLineItemId);
            }
          }
        }
      }
    }
    if (serviceItem.lineItems?.length) {
      for (const recurringLineItem of serviceItem.lineItems) {
        if (recurringLineItem.billableLineItemId) {
          billableLineItemsIds.push(recurringLineItem.billableLineItemId);
        }
      }
    }
  }
  return { materialsIds, billableServicesIds, billableLineItemsIds };
};
