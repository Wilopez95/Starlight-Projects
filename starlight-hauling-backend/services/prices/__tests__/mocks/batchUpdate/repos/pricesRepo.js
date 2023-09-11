import { prices } from '../../../data/batchUpdate/prices.js';

const PriceRepo = {
  getInstance() {
    return {
      getAllForBatch({ condition: { entityType } }) {
        if (entityType) {
          return prices.filter(item => item.entityType === entityType);
        }
        return prices;
      },
      updateMany({ data }) {
        return data;
      },
      insertMany({ data }) {
        return data;
      },
      deleteByIds({ ids }) {
        return ids;
      },
    };
  },
};

export default PriceRepo;
