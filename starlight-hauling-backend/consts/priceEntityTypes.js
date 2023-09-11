import mapValues from 'lodash/mapValues.js';
import camelCase from 'lodash/camelCase.js';

export const PRICE_ENTITY_TYPE = {
  oneTimeService: 'ONE_TIME_SERVICE',
  recurringService: 'RECURRING_SERVICE',
  oneTimeLineItem: 'ONE_TIME_LINE_ITEM',
  recurringLineItem: 'RECURRING_LINE_ITEM',
  threshold: 'THRESHOLD',
  surcharge: 'SURCHARGE',
};

// remove when threshold and surcharge will be implemented
export const PRICE_ENTITY_TYPE_FOR_BATCH = [
  'ONE_TIME_SERVICE',
  'RECURRING_SERVICE',
  'ONE_TIME_LINE_ITEM',
  'RECURRING_LINE_ITEM',
];

// maybe just use Object.keys as values?
export const PRICE_ENTITY_TYPE_CAMEL_CASE = mapValues(PRICE_ENTITY_TYPE, camelCase);

export const PRICE_ENTITY_TYPES = Object.values(PRICE_ENTITY_TYPE);
