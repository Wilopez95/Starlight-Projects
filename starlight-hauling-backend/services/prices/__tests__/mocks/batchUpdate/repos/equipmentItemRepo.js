import AllIds from '../../../data/batchUpdate/getAllIds.js';

const EquipmentItemRepo = {
  getInstance() {
    return {
      getAll() {
        return AllIds;
      },
    };
  },
};

export default EquipmentItemRepo;
