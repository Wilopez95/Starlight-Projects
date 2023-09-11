/* eslint-disable no-unused-vars */
const GlobalRatesServiceRepo = {
  getHistoricalInstance() {
    return {
      getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        billableServiceId,
        materialId,
      }) {
        return { price: 316, globalRatesServicesId: 422 };
      },
    };
  },
  getInstance() {
    return {
      getAll() {
        return [];
      },
      getOne() {
        return {};
      },
    };
  },
};

export default GlobalRatesServiceRepo;
