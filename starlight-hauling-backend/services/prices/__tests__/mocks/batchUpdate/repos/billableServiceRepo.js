import AllIds from '../../../data/batchUpdate/getAllIds.js';

const BillableServiceRepo = {
  getInstance() {
    return {
      getAll() {
        return AllIds;
      },
    };
  },
};

export default BillableServiceRepo;
