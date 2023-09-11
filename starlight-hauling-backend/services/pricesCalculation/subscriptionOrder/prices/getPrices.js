import calculateSubscriptionOrderPrice from './subscriptionOrderPrice.js';
import calculateLineItemPrice from './lineItemPrice.js';

const getPrices = async (
  ctx,
  {
    businessUnitId,
    businessLineId,
    serviceDate,
    customRatesGroupId,
    subscriptionOrder,
    serviceItemBillableServiceId = null,
    forceInput = true,
  },
  dependencies,
) => {
  const {
    price: overriddenSubscriptionOrderPrice,
    billableServiceId: subscriptionOrderBillableServiceId,
    lineItems = [],
    subscriptionOrderId,
    materialId,
  } = subscriptionOrder;

  const {
    price,
    customRatesGroupServicesId = null,
    globalRatesServicesId = null,
  } = await calculateSubscriptionOrderPrice(
    ctx,
    {
      price: overriddenSubscriptionOrderPrice,
      specifiedDate: serviceDate,
      billableServiceId: subscriptionOrderBillableServiceId,
      parentBillableServiceId: serviceItemBillableServiceId,
      subscriptionOrderId,
      businessUnitId,
      businessLineId,
      customRatesGroupId,
      materialId,
      forceInput,
    },
    dependencies,
  );

  const prices = {
    price,
    customRatesGroupServicesId,
    globalRatesServicesId,
  };

  prices.lineItems =
    lineItems &&
    (await Promise.all(
      lineItems.map(
        async ({
          price: overriddenLineItemPrice,
          lineItemId,
          billableLineItemId,
          materialId: lineItemMaterialId,
        }) => {
          const {
            price: lineItemPrice,
            globalRatesLineItemsId = null,
            customRatesGroupLineItemsId = null,
          } = await calculateLineItemPrice(
            ctx,
            {
              price: overriddenLineItemPrice,
              specifiedDate: serviceDate,
              materialId: lineItemMaterialId,
              lineItemId,
              billableLineItemId,
              businessUnitId,
              businessLineId,
              customRatesGroupId,
              forceInput,
            },
            dependencies,
          );

          return {
            price: lineItemPrice,
            globalRatesLineItemsId,
            customRatesGroupLineItemsId,
          };
        },
      ),
    ));

  return prices;
};

export default getPrices;
