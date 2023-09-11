/* eslint-disable no-unused-vars */
const SubscriptionLineItemRepo = {
  getHistoricalInstance() {
    return {
      getItemBySpecificDate({ lineItemId, specifiedDate, withOriginalIds }) {
        return {
          unlockOverrides: false,
          price: 0,
          quantity: 0,
          prorationEffectiveDate: new Date().toISOString(),
          prorationEffectivePrice: 0,
          prorationOverride: false,
          globalRatesRecurringLineItemsBillingCycleId: 0,
          customRatesGroupRecurringLineItemBillingCycleId: 0,
          customRatesGroupOriginalId: 0,
          billableLineItemId: 0,
          billingCycle: 'monthly',
        };
      },
    };
  },
};

export default SubscriptionLineItemRepo;
