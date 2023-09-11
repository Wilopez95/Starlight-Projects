import { BusinessLineShortType } from '@root/api/masterRoute/types';
import { BusinessLineType } from '@root/consts';

export const getBusinessLineTypesValue = (
  businessLineType?: BusinessLineType,
): BusinessLineShortType[] => {
  switch (businessLineType) {
    case BusinessLineType.portableToilets:
      return ['PT'];
    case BusinessLineType.commercialWaste:
    case BusinessLineType.residentialWaste:
      return ['C', 'R', 'CR'];
    default:
      return [];
  }
};
