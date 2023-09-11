import { ScaleUnitOfMeasurement } from '../graphql/api';

export enum UnitOfMeasurementType {
  ShortTons = 'short_tons',
  LongTons = 'long_tons',
  MetricTons = 'metric_tons',
  Yards = 'yards',
  CubicMeters = 'cubic_meters',
  Kilograms = 'kilograms',
  Pounds = 'pounds',
}

const uomToKgConversionTable = {
  [UnitOfMeasurementType.ShortTons]: 907.185,
  [UnitOfMeasurementType.LongTons]: 1016.05,
  [UnitOfMeasurementType.MetricTons]: 1000,
  [UnitOfMeasurementType.CubicMeters]: 1000,
  [UnitOfMeasurementType.Yards]: 651.48741818183,
  [UnitOfMeasurementType.Kilograms]: 1,
  [UnitOfMeasurementType.Pounds]: 0.453592,
};

const uomConversionTable = {
  [UnitOfMeasurementType.ShortTons]: 0.001102,
  [UnitOfMeasurementType.LongTons]: 0.000984207,
  [UnitOfMeasurementType.MetricTons]: 0.001,
  [UnitOfMeasurementType.CubicMeters]: 0.001,
  [UnitOfMeasurementType.Yards]: 0.0015349490597851,
  [UnitOfMeasurementType.Kilograms]: 1,
  [UnitOfMeasurementType.Pounds]: 2.20462,
};

const uomTranslationTable = {
  [UnitOfMeasurementType.ShortTons]: 'Short Tons',
  [UnitOfMeasurementType.LongTons]: 'Long Tons',
  [UnitOfMeasurementType.MetricTons]: 'Metric Tons',
  [UnitOfMeasurementType.CubicMeters]: 'Cubic Meters',
  [UnitOfMeasurementType.Yards]: 'Yards',
  [UnitOfMeasurementType.Kilograms]: 'Kilograms',
  [UnitOfMeasurementType.Pounds]: 'Pounds',
};

const throwUnmmapedConversionUnitError = (unit: UnitOfMeasurementType) => {
  const expectedUnits = Object.keys(uomConversionTable).reduce((a, b) => `${a}, ${b}`);

  throw new Error(`Invalid multiplier, given ${unit}, expected ${expectedUnits}`);
};

const doRoundUpUOM: Record<UnitOfMeasurementType, boolean> = {
  [UnitOfMeasurementType.CubicMeters]: false,
  [UnitOfMeasurementType.Kilograms]: false,
  [UnitOfMeasurementType.LongTons]: false,
  [UnitOfMeasurementType.MetricTons]: false,
  [UnitOfMeasurementType.Pounds]: true,
  [UnitOfMeasurementType.ShortTons]: false,
  [UnitOfMeasurementType.Yards]: false,
};

export type ConvertMaterialWeights = (amount: number, toUnit: UnitOfMeasurementType) => number;

const getUomTypeFromScaleUom = (uomStr: string): UnitOfMeasurementType => {
  switch (uomStr) {
    case ScaleUnitOfMeasurement.MetricTons:
      return UnitOfMeasurementType.MetricTons;
    case ScaleUnitOfMeasurement.LongTons:
      return UnitOfMeasurementType.LongTons;
    case ScaleUnitOfMeasurement.ShortTons:
      return UnitOfMeasurementType.ShortTons;
    case ScaleUnitOfMeasurement.Kilograms:
      return UnitOfMeasurementType.Kilograms;
    case ScaleUnitOfMeasurement.Pounds:
      return UnitOfMeasurementType.Pounds;
  }

  throw new Error(`ScaleUoM of type ${uomStr} not found in UnitOfMeasurementType`);
};

export const getUomTypeFromString = (uomStr: string): UnitOfMeasurementType => {
  switch (uomStr) {
    case UnitOfMeasurementType.CubicMeters:
      return UnitOfMeasurementType.CubicMeters;
    case UnitOfMeasurementType.LongTons:
      return UnitOfMeasurementType.LongTons;
    case UnitOfMeasurementType.MetricTons:
      return UnitOfMeasurementType.MetricTons;
    case UnitOfMeasurementType.ShortTons:
      return UnitOfMeasurementType.ShortTons;
    case UnitOfMeasurementType.Yards:
      return UnitOfMeasurementType.Yards;
    case UnitOfMeasurementType.Kilograms:
      return UnitOfMeasurementType.Kilograms;
    case UnitOfMeasurementType.Pounds:
      return UnitOfMeasurementType.Pounds;
  }

  try {
    return getUomTypeFromScaleUom(uomStr);
  } catch (e) {
    throw new Error(`UoM of type ${uomStr} not found in UnitOfMeasurementType`);
  }
};

export const convertKgToUom = (amount: number, toUnit: UnitOfMeasurementType): number => {
  const multiplier = uomConversionTable[toUnit];

  if (!multiplier) {
    throwUnmmapedConversionUnitError(toUnit);
  }

  let result = parseFloat((amount * multiplier).toFixed(2));

  if (doRoundUpUOM[toUnit]) {
    result = parseFloat((amount * multiplier).toFixed(0));

    return Math.ceil(Math.round((result + Number.EPSILON) * 100) / 100);
  }

  return result;
};

export const convertUomToKg = (amount: number, fromUnit: UnitOfMeasurementType): number => {
  const coef = uomToKgConversionTable[fromUnit];

  if (!coef) {
    throwUnmmapedConversionUnitError(fromUnit);
  }

  return parseFloat((amount * coef).toFixed(4));
};

export const getUomTranslation = (unit: UnitOfMeasurementType | string): string => {
  let uom;

  try {
    uom = getUomTypeFromString(unit);
  } catch (e) {
    uom = getUomTypeFromScaleUom(unit);
  }

  return uomTranslationTable[uom];
};
