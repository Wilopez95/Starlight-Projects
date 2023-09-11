import { IEntity } from './Entity';

export interface IEquipmentItem extends IEntity {
  type: string;
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
  originalId: number;
}
