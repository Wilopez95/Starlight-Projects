import cloneDeep from 'lodash/cloneDeep.js';
import pick from 'lodash/fp/pick.js';

import priceGroups from './data/priceGroups.js';

const PricesGroupRepo = {
  getInstance() {
    return {
      getHistoricalRecordById({ id, fields }) {
        return pick(fields)(cloneDeep(priceGroups.historicalByOriginal[id]));
      },
    };
  },
};

export default PricesGroupRepo;
