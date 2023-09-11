import { EquipmentItemType, IEquipmentItem } from '@root/types';

export const getEquipmentItemMock = (): IEquipmentItem => ({
  id: 1,
  createdAt: new Date('December 1, 2021 00:00:00'),
  updatedAt: new Date('December 2, 2021 00:00:00'),
  type: EquipmentItemType.portableToilet,
  size: 1,
  imageUrl: '',
  shortDescription: 'short description',
  description: 'description',
  length: 1,
  width: 1,
  height: 1,
  emptyWeight: 1,
  closedTop: false,
  active: true,
  businessLineId: '1',
  customerOwned: false,
  containerTareWeightRequired: false,
});
