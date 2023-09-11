export const mapNestedEntitiesIdsToHistorical = ({
  serviceItems,
  historicalMaterials,
  historicalBillableServices,
  historicalBillableLineItems,
  skipIfExists = false, // in some cases FE already sends historical IDs when editing
}) => {
  const materialsMap = (historicalMaterials?.filter(Boolean) || []).reduce((res, item) => {
    res[item.originalId] = item.id;
    return res;
  }, {});
  const billableServicesMap = (historicalBillableServices?.filter(Boolean) || []).reduce(
    (res, item) => {
      res[item.originalId] = item.id;
      return res;
    },
    {},
  );
  const billableLineItemsMap = (historicalBillableLineItems?.filter(Boolean) || []).reduce(
    (res, item) => {
      res[item.originalId] = item.id;
      return res;
    },
    {},
  );

  const mappedServiceItems = [];
  for (const serviceItem of serviceItems) {
    const mappedServiceItem = serviceItem;
    if (!(mappedServiceItem.id && skipIfExists)) {
      if (serviceItem.materialId !== undefined) {
        mappedServiceItem.materialId =
          (serviceItem.materialId && materialsMap[serviceItem.materialId]) || null;
      }
      if (serviceItem.billableServiceId !== undefined) {
        mappedServiceItem.billableServiceId =
          (serviceItem.billableServiceId && billableServicesMap[serviceItem.billableServiceId]) ||
          null;
      }
      if (serviceItem.subscriptionOrders?.length) {
        serviceItem.subscriptionOrders.forEach((subscriptionOrder, i) => {
          if (!(mappedServiceItem.subscriptionOrders[i].id && skipIfExists)) {
            mappedServiceItem.subscriptionOrders[i].billableServiceId =
              (subscriptionOrder.billableServiceId &&
                billableServicesMap[subscriptionOrder.billableServiceId]) ||
              null;
            if (subscriptionOrder.lineItems?.length) {
              subscriptionOrder.lineItems.forEach((oneTimeLineItem, j) => {
                if (!(mappedServiceItem.subscriptionOrders[i].lineItems[j].id && skipIfExists)) {
                  mappedServiceItem.subscriptionOrders[i].lineItems[j].billableLineItemId =
                    (oneTimeLineItem.billableLineItemId &&
                      billableLineItemsMap[oneTimeLineItem.billableLineItemId]) ||
                    null;
                }
              });
            }
          }
        });
      }
      if (serviceItem.lineItems?.length) {
        serviceItem.lineItems.forEach((recurringLineItem, i) => {
          if (!(mappedServiceItem.lineItems[i].id && skipIfExists)) {
            mappedServiceItem.lineItems[i].billableLineItemId =
              (recurringLineItem.billableLineItemId &&
                billableLineItemsMap[recurringLineItem.billableLineItemId]) ||
              null;
          }
        });
      }
    }
    mappedServiceItems.push(mappedServiceItem);
  }

  return mappedServiceItems;
};
