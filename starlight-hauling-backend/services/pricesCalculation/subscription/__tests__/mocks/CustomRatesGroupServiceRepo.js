/* eslint-disable no-unused-vars */
const CustomRatesGroupServiceRepo = {
  getHistoricalInstance() {
    return {
      getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        customRatesGroupId,
        billableServiceId,
        materialId,
      }) {
        return { price: 310, customRatesGroupServicesId: 4191 };
      },
    };
  },
};

export default CustomRatesGroupServiceRepo;
