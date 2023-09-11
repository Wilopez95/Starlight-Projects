/* eslint-disable no-unused-vars */
import { FREQUENCY_TYPE } from '../../../../../consts/frequencyTypes.js';

const RecurringServicesGlobalRatesRepo = {
  getHistoricalInstance() {
    return {
      getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        billableServiceId,
        serviceFrequencyId,
        materialId,
      }) {
        return {
          price: 116,
          frequencyTimes: 2,
          frequencyType: FREQUENCY_TYPE.everyXDays,
          globalRatesRecurringServicesId: 427,
        };
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
      getBy() {
        return {};
      },
    };
  },
};

export default RecurringServicesGlobalRatesRepo;
