import { type FileWithPreview } from '../base/file';

import { type IEntity } from './entity';

export enum EquipmentItemType {
  rollOffContainer = 'rolloff_container',
  wasteContainer = 'waste_container',
  portableToilet = 'portable_toilet',
  unspecified = 'unspecified',
}

export interface IEquipmentItem extends IEntity {
  type: EquipmentItemType;
  size: number | null;
  imageUrl: string | null;
  shortDescription: string;
  description: string;
  length: number | null;
  width: number | null;
  height: number | null;
  emptyWeight: number | null;
  closedTop: boolean;
  active: boolean;
  businessLineId: string;
  customerOwned: boolean;
  containerTareWeightRequired: boolean;
  recyclingDefault?: boolean;
}

export type EquipmentItemWithImage = Omit<IEquipmentItem, 'imageUrl'> & {
  image: FileWithPreview | null | undefined;
  imageUrl: string | null | undefined;
};
