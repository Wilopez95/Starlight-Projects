import round from 'lodash/round.js';
import cloneDeep from 'lodash/cloneDeep.js';
import mapValues from 'lodash/mapValues.js';
import isPlainObject from 'lodash/isPlainObject.js';

const isFloat = num => Number(num) === num && !(num % 1 === 0);
const roundFloat = num => (isFloat(num) ? round(num, 2) : num);

const roundPrices = input => {
  if (Array.isArray(input)) {
    return input.map(roundPrices);
  }

  if (isPlainObject(input)) {
    return mapValues(input, roundPrices);
  }

  return roundFloat(input);
};

const roundPricesDeep = input => {
  const cloned = cloneDeep(input);
  return roundPrices(cloned);
};

export default roundPricesDeep;
