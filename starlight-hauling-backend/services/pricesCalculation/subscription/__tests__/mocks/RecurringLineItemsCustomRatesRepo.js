/* eslint-disable no-unused-vars */
const RecurringLineItemsCustomRatesRepo = {
  getHistoricalInstance() {
    return {
      getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        customRatesGroupId,
        billableLineItemId,
        billingCycle,
      }) {
        return { price: 210, customRatesGroupRecurringLineItemBillingCycleId: 700 };
      },
    };
  },
};

export default RecurringLineItemsCustomRatesRepo;
