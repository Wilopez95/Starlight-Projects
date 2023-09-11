import { ISelectOption } from '@root/core/common/Select/types';

export enum BusinessLineType {
  rollOff = 'rollOff',
  commercialWaste = 'commercialWaste',
  residentialWaste = 'residentialWaste',
  portableToilets = 'portableToilets',
}

export const BusinessLineTypes: ISelectOption[] = [
  {
    label: 'Roll-off',
    hint: 'Roll-off',
    value: BusinessLineType.rollOff,
  },
  {
    label: 'Commercial waste disposal',
    hint: 'Commercial waste disposal',
    value: BusinessLineType.commercialWaste,
  },
  {
    label: 'Residential waste disposal',
    hint: 'Residential waste disposal',
    value: BusinessLineType.residentialWaste,
  },
  {
    label: 'Portable toilets rental',
    hint: 'Portable toilets rental',
    value: BusinessLineType.portableToilets,
  },
];
