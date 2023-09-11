import cloneDeep from 'lodash/cloneDeep.js';
import mockSurcharges from './data/surcharges.js';

const surcharges = {
  1: mockSurcharges,
};

const SurchargeRepo = {
  getInstance() {
    return {
      getAll({ condition: { businessLineId } }) {
        return cloneDeep(surcharges[businessLineId]);
      },
    };
  },
};

export default SurchargeRepo;
