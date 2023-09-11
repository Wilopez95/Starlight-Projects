/* eslint-disable no-unused-vars */
const SubscriptionServiceItemRepo = {
  getHistoricalInstance() {
    return {
      getItemBySpecificDate({ serviceItemId, specifiedDate, withOriginalIds }) {
        return {
          unlockOverrides: false,
          price: 0,
          quantity: 0,
          frequencyTimes: 0,
          frequencyType: 0,
          prorationEffectiveDate: new Date().toISOString(),
          prorationEffectivePrice: 0,
          prorationOverride: false,
          globalRatesRecurringServicesId: 0,
          customRatesGroupServicesId: 0,
          customRatesGroupOriginalId: 0,
          billableServiceOriginalId: 0,
          serviceFrequencyId: 0,
          materialOriginalId: 0,
        };
      },
    };
  },
};

export default SubscriptionServiceItemRepo;
