import { EquipmentItemType } from '@root/types';

import { BusinessLineType } from './businessLine';

export const equipmentItemTypeByBusinessLine: Record<BusinessLineType, EquipmentItemType> = {
  [BusinessLineType.rollOff]: EquipmentItemType.rollOffContainer,
  [BusinessLineType.commercialWaste]: EquipmentItemType.wasteContainer,
  [BusinessLineType.residentialWaste]: EquipmentItemType.wasteContainer,
  [BusinessLineType.portableToilets]: EquipmentItemType.portableToilet,
  [BusinessLineType.recycling]: EquipmentItemType.unspecified,
};
