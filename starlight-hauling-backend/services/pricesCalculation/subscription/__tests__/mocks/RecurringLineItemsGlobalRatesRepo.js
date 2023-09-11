/* eslint-disable no-unused-vars */
const RecurringLineItemsGlobalRatesRepo = {
  getHistoricalInstance() {
    return {
      getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        billableLineItemId,
        billingCycle,
      }) {
        return { price: 216, globalRatesRecurringLineItemsBillingCycleId: 354 };
      },
    };
  },
};

export default RecurringLineItemsGlobalRatesRepo;
