/* eslint-disable no-nested-ternary */
import { MEASUREMENT_UNIT } from '../consts/units.js';

/**
 * returns coefficient to convert from metric value
 * @param {string} unit - tenant unit of measurement
 * @returns {number} unit cofeefficient
 */
export const unitCoefficient = unit => {
  if (unit === MEASUREMENT_UNIT.us) {
    return 1.102311;
  }
  if (unit === MEASUREMENT_UNIT.imperial) {
    return 0.984207;
  }
  return 1.0;
};
