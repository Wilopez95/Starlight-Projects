const serviceInclusions = {
  1729: [],
};

const BillableServiceInclusionRepo = {
  getHistoricalInstance() {
    return {
      getIncludedServicesByServiceIdBulk({ billableServiceIds }) {
        return serviceInclusions[billableServiceIds];
      },
    };
  },
};

export default BillableServiceInclusionRepo;
