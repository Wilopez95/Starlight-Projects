/* eslint-disable no-nested-ternary */
import { ISelectOption } from '@starlightpro/shared-components';

import { enableRecyclingFeatures, isCore } from '@root/consts/env';

// eslint-disable-next-line no-shadow
export enum BusinessLineType {
  rollOff = 'rollOff',
  commercialWaste = 'commercialWaste',
  residentialWaste = 'residentialWaste',
  portableToilets = 'portableToilets',
  recycling = 'recycling',
}

const CRPTBusinessLineTypes: ISelectOption[] = [
  {
    label: 'RollOff',
    hint: 'RollOff',
    value: BusinessLineType.rollOff,
  },
  {
    label: 'CommercialWasteDisposal',
    hint: 'CommercialWasteDisposal',
    value: BusinessLineType.commercialWaste,
  },
  {
    label: 'ResidentialWasteDisposal',
    hint: 'ResidentialWasteDisposal',
    value: BusinessLineType.residentialWaste,
  },
  {
    label: 'PortableToiletsRental',
    hint: 'PortableToiletsRental',
    value: BusinessLineType.portableToilets,
  },
];
const RecyclingBusinessLineType: ISelectOption[] = [
  {
    label: 'Recycling',
    hint: 'Recycling',
    value: BusinessLineType.recycling,
  },
  {
    label: 'RollOff',
    hint: 'RollOff',
    value: BusinessLineType.rollOff,
  },
];

export const BusinessLineTypes: ISelectOption[] = isCore
  ? enableRecyclingFeatures
    ? RecyclingBusinessLineType // uat-rec (recycling)
    : [] // uat (core)
  : CRPTBusinessLineTypes.concat(RecyclingBusinessLineType); // development (CRPT)
