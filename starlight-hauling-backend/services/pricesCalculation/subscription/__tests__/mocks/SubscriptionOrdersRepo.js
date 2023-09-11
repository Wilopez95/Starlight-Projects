/* eslint-disable no-unused-vars */
const SubscriptionOrdersRepo = {
  getHistoricalInstance() {
    return {
      getItemBySpecificDate({ subscriptionOrderId, withOriginalIds }) {
        return {
          unlockOverrides: false,
          price: 0,
          globalRatesServicesId: 0,
          customRatesGroupServicesId: 0,
          customRatesGroupOriginalId: 0,
          billableServiceOriginalId: 0,
          materialOriginalId: 0,
        };
      },
    };
  },
};

export default SubscriptionOrdersRepo;
