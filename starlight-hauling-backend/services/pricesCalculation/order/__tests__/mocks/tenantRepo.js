import cloneDeep from 'lodash/cloneDeep.js';
import mockTenants from './data/tenants.js';

const tenants = {
  stark: mockTenants,
};

const TenantsRepo = {
  getInstance() {
    return {
      getBy({ condition: { name } }) {
        return cloneDeep(tenants[name]);
      },
    };
  },
};

export default TenantsRepo;
