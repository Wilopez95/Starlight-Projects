import AllIds from '../../../data/batchUpdate/getAllIds.js';

const MaterialRepo = {
  getInstance() {
    return {
      getRatesByApplication() {
        return AllIds;
      },
    };
  },
};

export default MaterialRepo;
