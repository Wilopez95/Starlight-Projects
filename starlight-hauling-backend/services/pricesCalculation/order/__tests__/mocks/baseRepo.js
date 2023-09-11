import cloneDeep from 'lodash/cloneDeep.js';

import priceGroups from './data/priceGroups.js';

const BaseRepo = {
  getNewestHistoricalRecord({ condition: { originalId } }) {
    return cloneDeep(priceGroups.historicalByOriginal[originalId]);
  },
};

export default BaseRepo;
