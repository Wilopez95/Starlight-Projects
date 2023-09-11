import isPlainObject from 'lodash/isPlainObject.js';
import mapValues from 'lodash/mapValues.js';
import lowerFirst from 'lodash/lowerFirst.js';
import upperFirst from 'lodash/upperFirst.js';
import cloneDeep from 'lodash/cloneDeep.js';

const prefix = 'refactored';
const targets = [
  /total$/i,
  /amount$/i,
  /price$/i,
  /priceid$/i,
  /pricegroupid$/i,
  /invoicedat$/i,
  /paidat$/i,
];

const replaceLegacyWithRefactoredFields = input => {
  if (Array.isArray(input)) {
    return input.map(replaceLegacyWithRefactoredFields);
  }

  if (isPlainObject(input)) {
    const replaceSubset = Object.fromEntries(
      Object.entries(input)
        .filter(([key]) => key.startsWith(prefix))
        .map(([key, val]) => [lowerFirst(key.replace(prefix, '')), val]),
    );

    const replaced = {
      ...input,
      ...replaceSubset,
    };

    return mapValues(
      Object.fromEntries(Object.entries(replaced).filter(([key]) => !key.startsWith(prefix))),
      replaceLegacyWithRefactoredFields,
    );
  }

  return input;
};

export const replaceLegacyWithRefactoredFieldsDeep = input => {
  const cloned = cloneDeep(input);
  return replaceLegacyWithRefactoredFields(cloned);
};

const prefixFieldsWithRefactored = input => {
  if (Array.isArray(input)) {
    return input.map(prefixFieldsWithRefactored);
  }

  if (isPlainObject(input)) {
    const renamedEntries = Object.entries(input).map(([key, val]) => {
      if (!key.startsWith(prefix) && targets.some(target => target.test(key))) {
        return [`${prefix}${upperFirst(key)}`, val];
      }

      return [key, val];
    });

    return mapValues(Object.fromEntries(renamedEntries), prefixFieldsWithRefactored);
  }

  return input;
};

export const prefixFieldsWithRefactoredDeep = input => {
  const cloned = cloneDeep(input);
  return prefixFieldsWithRefactored(cloned);
};

export const prefixKeyWithRefactored = key => {
  if (!key.startsWith(prefix) && targets.some(target => target.test(key))) {
    return `${prefix}${upperFirst(key)}`;
  }

  return key;
};
