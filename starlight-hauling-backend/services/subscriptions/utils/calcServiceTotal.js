export const calcServiceTotal = prorationInfo =>
  prorationInfo.reduce(
    (serviceTotal, { serviceItemProrationInfo }) =>
      serviceTotal +
      serviceItemProrationInfo.reduce((total, { proratedTotal }) => total + proratedTotal, 0),
    0,
  );
