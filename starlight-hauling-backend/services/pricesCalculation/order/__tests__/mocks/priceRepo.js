import cloneDeep from 'lodash/cloneDeep.js';
import prices from './data/prices.js';

const PricesRepo = {
  getInstance() {
    return {
      getAllByDate({ condition: { entityType } }) {
        return cloneDeep(prices[entityType]);
      },
      getAllGeneral({ condition: { entityType } }) {
        return cloneDeep(prices[entityType]);
      },
      getAllCustom({ condition: { entityType } }) {
        return cloneDeep(prices[entityType]);
      },
    };
  },
};

export default PricesRepo;
