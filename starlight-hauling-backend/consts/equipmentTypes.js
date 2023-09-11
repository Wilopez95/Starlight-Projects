import { ACTION } from './actions.js';

export const EQUIPMENT_TYPE = {
  rollOffContainer: 'rolloff_container',
  wasteContainer: 'waste_container',
  portableToilet: 'portable_toilet',
  unspecified: 'unspecified',
};

export const EQUIPMENT_TYPES = Object.values(EQUIPMENT_TYPE);

export const COE_ALLOWED_BY_ACTION = [
  ACTION.none,
  ACTION.generalPurpose,
  ACTION.dumpReturn,
  ACTION.service,
];
