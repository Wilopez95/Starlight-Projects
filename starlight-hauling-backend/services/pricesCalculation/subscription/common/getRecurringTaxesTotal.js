const getRecurringTaxesTotal = (serviceItems = []) => {
  const taxesTotal = serviceItems.reduce((total, { appliedTaxes, lineItems }) => {
    const serviceItemTotal =
      appliedTaxes?.flat().reduce((sum, { calculatedTax = 0 }) => sum + calculatedTax, 0) || 0;
    const lineItemsTotal =
      lineItems?.reduce(
        (acc, { appliedTaxes: lineItemAppliedTaxes }) =>
          acc +
            lineItemAppliedTaxes
              ?.flat()
              .reduce((sum, { calculatedTax = 0 }) => sum + calculatedTax, 0) || 0,
        0,
      ) ?? 0;

    return total + serviceItemTotal + lineItemsTotal;
  }, 0);

  return taxesTotal;
};

export default getRecurringTaxesTotal;
