import { IEntity } from './';

export interface IMaterial extends IEntity {
  active: boolean;
  description: string;
  misc: boolean;
  manifested: boolean;
  recycle: boolean;
  rolloff: boolean;
  businessLineId: number;
  equipmentItemIds?: number[];
}
