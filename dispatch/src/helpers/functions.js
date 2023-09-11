import * as R from 'ramda';

export const alreadyInState = R.uncurryN(2, (id /* , state */) => R.find(R.propEq('id', id)));

export const labelAndValueExtractor = (value) => ({ label: value, value });

// code smell
export const labelAndValueExtractorAvoidingDots = (value) => ({
  label: value.replace(/\./g, ' '),
  value: value.replace(/\./g, ' '),
  title: value,
});

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param  {string} key key to sort on
 * @param  {boolean} desc=false to sort in descending order
 *
 * @returns {function} to be inserted in .sort method
 */
export const sortBy =
  (key, desc = false) =>
  (a, b) => {
    if (a[key] > b[key]) {
      return desc ? -1 : 1;
    }
    if (a[key] < b[key]) {
      return desc ? 1 : -1;
    }
    return 0;
  };

/**
 * @param  {function} onClick click handler to be bound to element
 *
 * @returns  {object} object of properties to semantically hanlde click
 */
export const clickable = (onClick) => ({
  onClick,
  tabIndex: 0,
  role: 'button',
  onKeyPress: (e) => (e.keyCode === 13 || e.charCode === 13) && onClick(),
});

/**
 * @param  {array} array input array
 *
 * @returns  {array} array of only unique values
 */
export const uniq = (array) => Array.from(new Set(array));

/**
 * Deep merges two objets.
 * @param  {Object} object destination object
 * @param  {Object} source source obejct
 *
 * @returns {Object} new object
 */
export const merge = (object, source) => {
  if (object === source) {
    return object;
  }

  const newValue = {
    ...object,
    ...source,
  };

  Object.entries(source).forEach(([key, value]) => {
    if (object[key] && typeof object[key] === 'object') {
      newValue[key] = merge(object[key], value);
    } else {
      newValue[key] = value;
    }
  });

  return newValue;
};
