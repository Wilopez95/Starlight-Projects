import { ISelectOption } from '@starlightpro/shared-components';
import { TFunction } from 'i18next';

const I18N_PATH = 'Text.';

export enum BusinessLineType {
  rollOff = 'rollOff',
  commercialWaste = 'commercialWaste',
  residentialWaste = 'residentialWaste',
  portableToilets = 'portableToilets',
}

export enum BusinessLineTypeSymbol {
  C = 'C',
  R = 'R',
  CR = 'CR',
  PT = 'PT',
}

export const businessLinesByType: (t: TFunction) => ISelectOption[] = t => [
  {
    label: t(`${I18N_PATH}Commercial`),
    value: BusinessLineTypeSymbol.C,
  },
  {
    label: t(`${I18N_PATH}Residential`),
    value: BusinessLineTypeSymbol.R,
  },
  {
    label: t(`${I18N_PATH}CommercialResidential`),
    value: BusinessLineTypeSymbol.CR,
  },
  {
    label: t(`${I18N_PATH}PortableToilets`),
    value: BusinessLineTypeSymbol.PT,
  },
];

const businessLineNamesByType = {
  C: `${I18N_PATH}Commercial`,
  R: `${I18N_PATH}Residential`,
  CR: `${I18N_PATH}CommercialResidential`,
  PT: `${I18N_PATH}PortableToilets`,
};

export const getBusinessLineNameByType = (type: BusinessLineTypeSymbol) =>
  businessLineNamesByType[type];
