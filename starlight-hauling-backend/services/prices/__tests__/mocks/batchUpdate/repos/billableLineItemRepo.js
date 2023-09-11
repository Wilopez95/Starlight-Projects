import AllIds from '../../../data/batchUpdate/getAllIds.js';

const BillableLineItemRepo = {
  getInstance() {
    return {
      getAll() {
        return AllIds;
      },
    };
  },
};

export default BillableLineItemRepo;
