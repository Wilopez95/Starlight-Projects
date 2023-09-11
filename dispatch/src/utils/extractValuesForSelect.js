export const extractValuesForSelect = (constant) =>
  Object.keys(constant).map((key) => ({
    label: constant[key],
    value: constant[key],
  }));
