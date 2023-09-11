import mockPrices from '../data/getAllByPriceGroup/mockPrices.js';

const prices = {
  1: mockPrices,
  2: mockPrices,
};

const PriceRepo = {
  getInstance() {
    return {
      getAllByDate({ priceGroupId }) {
        return prices[priceGroupId];
      },
    };
  },
};

export default PriceRepo;
