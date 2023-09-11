import { CRPT_FEATURES_OFF, RECYCLING_FEATURES_ON } from '../config.js';

export const BUSINESS_LINE_TYPE = {
  rollOff: 'rollOff',
  commercialWaste: 'commercialWaste',
  residentialWaste: 'residentialWaste',
  portableToilets: 'portableToilets',
  recycling: 'recycling',
};

export const BUSINESS_LINE_TYPES = Object.values(BUSINESS_LINE_TYPE);

export const MAX_LENGTH_SHORT_NAME = 5;

export const DEFAULT_BUSINESS_LINES_SEED_DATA =
  CRPT_FEATURES_OFF || RECYCLING_FEATURES_ON
    ? [
        {
          name: 'Roll-Off Container',
          type: BUSINESS_LINE_TYPE.rollOff,
          description: 'Roll-off',
        },
      ]
    : [
        {
          name: 'Roll-Off Container',
          type: BUSINESS_LINE_TYPE.rollOff,
          description: 'Roll-off',
        },
        {
          name: 'Commercial',
          type: BUSINESS_LINE_TYPE.commercialWaste,
          description: 'Commercial waste disposal',
        },
        {
          name: 'Residential',
          type: BUSINESS_LINE_TYPE.residentialWaste,
          description: 'Residential waste disposal',
        },
        {
          name: 'Portable Toilet',
          type: BUSINESS_LINE_TYPE.portableToilets,
          description: 'Portable toilets rental',
        },
      ];
