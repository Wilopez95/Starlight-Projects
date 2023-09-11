import { registerEnumType } from 'type-graphql';

export enum MeasurementUnit {
  GRAM = 'GRAM',
  TON = 'TON',
  KILOGRAM = 'KILOGRAM',
}

export enum MeasurementType {
  HARDWARE = 'HARDWARE',
  MANUAL = 'MANUAL',
}

registerEnumType(MeasurementUnit, { name: 'MeasurementUnit' });
registerEnumType(MeasurementType, { name: 'MeasurementType' });
