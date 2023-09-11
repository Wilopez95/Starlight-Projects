import cloneDeep from 'lodash/cloneDeep.js';
import mockTaxDistricts from './data/taxDistricts.js';

const taxDistricts = {
  2961: mockTaxDistricts,
};

const TaxDistrictCustomerJobSiteRepo = {
  getInstance() {
    return {
      getTaxDistrictsByPairId(customerJobSiteId) {
        return cloneDeep(taxDistricts[customerJobSiteId]);
      },
    };
  },
};

export default TaxDistrictCustomerJobSiteRepo;
