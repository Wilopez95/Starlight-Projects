import round from 'lodash/round.js';

import configureMeasurements, { allMeasures, mass } from 'convert-units';

import { MEASUREMENT_UNIT, MOBILE_RATE_UNIT } from '../consts/units.js';

const BACK_END_WEIGHT_MEASURE = 'kg';
const BACK_END_LENGTH_MEASURE = 'm';
const BACK_END_VOLUME_MEASURE = 'm3';

const extendedMass = {
  systems: {
    metric: mass.systems.metric,
    imperial: {
      ...mass.systems.imperial,
      lt: {
        name: {
          singular: 'Long Ton',
          plural: 'Long Tons',
        },
        to_anchor: 2240, // pounds in long ton
      },
    },
  },
  anchors: {
    ...mass.anchors,
  },
};

export const convert = configureMeasurements.default({
  ...allMeasures,
  mass: extendedMass,
});

const convertor = (value, from, to) => round(convert(value).from(from).to(to), 2);

const unitsConvertorToKg = (value, units) => {
  switch (units) {
    case MOBILE_RATE_UNIT.tons: {
      return value * MOBILE_RATE_UNIT.kg_tons;
    }
    case MOBILE_RATE_UNIT.yard: {
      return value * MOBILE_RATE_UNIT.kg_yards;
    }
    default: {
      return 0;
    }
  }
};

const toSystem = {
  [MEASUREMENT_UNIT.imperial]: { weight: 'lt', volume: 'yd3', length: 'ft' },
  [MEASUREMENT_UNIT.us]: { weight: 't', volume: 'yd3', length: 'ft' },
  [MEASUREMENT_UNIT.metric]: { weight: 'mt', volume: 'm3', length: 'm' },
};

/**
 * convert value to selected unit of measure from CI(kg)
 */
export const weightToUnits = (value, toUnit, fromMeasures = BACK_END_WEIGHT_MEASURE) =>
  convertor(value, fromMeasures, toSystem[toUnit].weight);
/**
 * convert value from selected unit of measure to CI(kg)
 */
export const weightFromUnits = (value, fromUnit) => {
  return unitsConvertorToKg(value, fromUnit);
};
/**
 * convert value to selected unit of measure from CI(m3)
 */
export const volumeToUnits = (value, toUnit, fromMeasures = BACK_END_VOLUME_MEASURE) =>
  convertor(value, fromMeasures, toSystem[toUnit].volume);
/**
 * convert value from selected unit of measure to CI(m3)
 */
export const volumeFromUnits = (value, fromUnit, toMeasures = BACK_END_VOLUME_MEASURE) =>
  convertor(value, toSystem[fromUnit].volume, toMeasures);

/**
 * convert value to selected unit of measure from CI(m)
 */
export const lengthToUnits = (value, toUnit, fromMeasures = BACK_END_LENGTH_MEASURE) =>
  convertor(value, fromMeasures, toSystem[toUnit].length);
/**
 * convert value from selected unit of measure to CI(m)
 */
export const lengthFromUnits = (value, fromUnit, toMeasures = BACK_END_LENGTH_MEASURE) =>
  convertor(value, toSystem[fromUnit].length, toMeasures);
