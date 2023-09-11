import cloneDeep from 'lodash/cloneDeep.js';

const addTaxItemToDistrict = taxCalculationsByDistricts => (serviceItemTax, serviceItemIdx) => {
  if (!Array.isArray(taxCalculationsByDistricts[serviceItemIdx])) {
    taxCalculationsByDistricts[serviceItemIdx] = [];
  }

  taxCalculationsByDistricts[serviceItemIdx].push(...serviceItemTax);
};

const groupTaxesCalculationsByDistricts = (subscriptionOrders = []) => {
  const taxCalculationsByDistricts = [];

  cloneDeep(subscriptionOrders).forEach(subscriptionOrder => {
    const { appliedTaxes: subscriptionOrderAppliedTaxes, lineItems } = subscriptionOrder;
    subscriptionOrderAppliedTaxes.forEach(addTaxItemToDistrict(taxCalculationsByDistricts));

    lineItems.forEach(({ appliedTaxes }) => {
      appliedTaxes.forEach(addTaxItemToDistrict(taxCalculationsByDistricts));
    });
  });

  return taxCalculationsByDistricts;
};

export default groupTaxesCalculationsByDistricts;
