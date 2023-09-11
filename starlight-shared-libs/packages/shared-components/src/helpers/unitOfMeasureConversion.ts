import configureMeasurements, {
  length,
  mass,
  LengthSystems,
  MassSystems,
  VolumeSystems,
  Measure,
  volume,
} from 'convert-units';

import { round } from 'lodash-es';

type Systems = LengthSystems | VolumeSystems | MassSystems;
type Units = CustomMassUnits | CustomLengthUnits | CustomVolumeUnits;

enum UnitOfMeasurementType {
  ShortTons = 't',
  LongTons = 'lt',
  MetricTons = 'mt',
  Kilograms = 'kg',
  Pounds = 'lbs',
  Meters = 'm',
  Feet = 'ft',
  CubicYards = 'yd3',
  CubicMeters = 'm3',
  Yards = 'y',
}

// TODO - Do we need to support lbs here?
export type CustomMassUnits =
  | UnitOfMeasurementType.ShortTons
  | UnitOfMeasurementType.MetricTons
  | UnitOfMeasurementType.LongTons
  | UnitOfMeasurementType.Kilograms;
export type CustomLengthUnits = UnitOfMeasurementType.Meters | UnitOfMeasurementType.Feet;
export type CustomVolumeUnits =
  | UnitOfMeasurementType.CubicYards
  | UnitOfMeasurementType.CubicMeters;

interface UnitConfig {
  mass: CustomMassUnits;
  length: CustomLengthUnits;
  volume: CustomVolumeUnits;
}
type Measures = keyof UnitConfig;

type MeasureSystemConfig = {
  metric: UnitConfig;
  imperial: UnitConfig;
  us: UnitConfig;
};

const createUnitsOfMeasurementConfig = (
  mass: CustomMassUnits,
  length: CustomLengthUnits,
  volume: CustomVolumeUnits,
): UnitConfig => ({
  mass,
  length,
  volume,
});

const unitsConfig: MeasureSystemConfig = {
  metric: createUnitsOfMeasurementConfig(
    UnitOfMeasurementType.MetricTons,
    UnitOfMeasurementType.Meters,
    UnitOfMeasurementType.CubicMeters,
  ),
  imperial: createUnitsOfMeasurementConfig(
    UnitOfMeasurementType.LongTons,
    UnitOfMeasurementType.Feet,
    UnitOfMeasurementType.CubicYards,
  ),
  us: createUnitsOfMeasurementConfig(
    UnitOfMeasurementType.ShortTons,
    UnitOfMeasurementType.Feet,
    UnitOfMeasurementType.CubicYards,
  ),
};

// Add additional unit support of long tons for convert-units package
const extendedMass: Measure<MassSystems, CustomMassUnits> = {
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

const convert = configureMeasurements<Measures, Systems, Units>({
  length,
  volume,
  mass: extendedMass,
});

const convertUnitOfMeasure = (value: number, from: Units, to: Units, precision = 4): number => {
  if (!value) {
    return 0;
  }
  const convertedValue = convert(value).from(from).to(to);

  return round(convertedValue, precision);
};

export {
  convertUnitOfMeasure,
  UnitOfMeasurementType,
  Units,
  Measures,
  UnitConfig,
  MeasureSystemConfig,
  unitsConfig,
};
