/* eslint-disable no-unused-vars */
import { FREQUENCY_TYPE } from '../../../../../consts/frequencyTypes.js';

const RecurringServicesCustomRatesRepo = {
  getHistoricalInstance() {
    return {
      getRateBySpecificDate({
        specifiedDate,
        businessUnitId,
        businessLineId,
        customRatesGroupId,
        billableServiceId,
        serviceFrequencyId,
        materialId,
      }) {
        return {
          price: 110,
          frequencyTimes: 2,
          frequencyType: FREQUENCY_TYPE.everyXDays,
          customRatesGroupServicesId: 3740,
        };
      },
    };
  },
};

export default RecurringServicesCustomRatesRepo;
