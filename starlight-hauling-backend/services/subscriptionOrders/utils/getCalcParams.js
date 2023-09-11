export const getCalcParams = ({
  subsriptionOrder,
  updatedSubscriptionOrder,
  subscription,
  updates,
  customRatesGroupId,
  id,
}) => {
  const calcParams = {
    specifiedDate: updatedSubscriptionOrder.serviceDate,
    subscriptionOrderId: id,
    businessUnitId: subscription.businessUnitId,
    businessLineId: subscription.businessLineId,
    price: updates.price,
  };
  if (
    updates.billableServiceId &&
    updates.billableServiceId !== subsriptionOrder.billableServiceOriginalId
  ) {
    calcParams.billableServiceId = updates.billableServiceId;
    calcParams.forceInput = true;
  } else {
    calcParams.billableServiceId = subsriptionOrder.billableServiceOriginalId;
  }
  if (updates.materialId && updates.materialId !== subsriptionOrder.materialOriginalId) {
    calcParams.materialId = updates.materialId || null;
    calcParams.forceInput = true;
  } else {
    calcParams.materialId = subsriptionOrder.materialOriginalId;
  }
  if (
    updates.globalRatesServicesId &&
    updates.globalRatesServicesId !== subsriptionOrder.globalRatesServicesId
  ) {
    calcParams.customRatesGroupId =
      customRatesGroupId || subsriptionOrder.customRatesGroupOriginalId || null;
    calcParams.forceInput = true;
  }
  if (
    updates.customRatesGroupServicesId &&
    updates.customRatesGroupServicesId !== subsriptionOrder.customRatesGroupServicesId
  ) {
    calcParams.customRatesGroupId =
      customRatesGroupId || subsriptionOrder.customRatesGroupOriginalId || null;
    calcParams.forceInput = true;
  }
  return calcParams;
};
