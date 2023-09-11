export const isRecurringServicePriceIncluded = (billableServiceId, billableServiceInclusions) =>
  Object.values(billableServiceInclusions ?? {})
    .flat()
    .includes(billableServiceId);

export const isOneTimeServicePriceIncluded = ({
  billableServiceId,
  parentBillableServiceId,
  billableServiceInclusions,
} = {}) =>
  billableServiceInclusions?.[parentBillableServiceId]?.includes(billableServiceId) ?? false;
