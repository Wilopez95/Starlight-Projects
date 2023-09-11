/* eslint-disable no-unused-vars */
const CustomerRepo = {
  getInstance() {
    return {
      getGroupByCustomerId(id) {
        return 'commercial';
      },
    };
  },
};

export default CustomerRepo;
