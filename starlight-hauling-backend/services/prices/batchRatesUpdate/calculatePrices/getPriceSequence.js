import omit from 'lodash/fp/omit.js';

const omitFields = omit(['isGeneral', 'id']);

const getPriceSequence = ({
  nextPrice,
  effectiveDate,
  basePrice,
  oldPrice,
  generalPrice,
  priceGroupsIds,
  isCurrentTarget,
}) => {
  const nextValues = {
    price: nextPrice,
    nextPrice: null,
    startAt: effectiveDate,
    endAt: null,
    basePrice,
  };
  // TODO: current is not an array always
  const current = [];
  const next = [];

  if (oldPrice) {
    current.push({
      ...omit(['isGeneral'])(oldPrice),
      nextPrice,
      endAt: effectiveDate,
    });

    next.push({
      ...omitFields(oldPrice),
      ...nextValues,
    });
  }

  if (!isCurrentTarget && !oldPrice) {
    priceGroupsIds.forEach(priceGroupId => {
      next.push({ ...omitFields(generalPrice), priceGroupId, ...nextValues });
    });
  }

  return { current, next };
};

export default getPriceSequence;
