import { IEntity } from './';

export interface IMaterial extends IEntity {
  id: number;
  active: boolean;
  description: string;
  manifested: boolean;
  recycle: boolean;
  yard: boolean;
  misc: boolean;
  landfillCanOverride: boolean;
  businessLineId: string;
  useForLoad: boolean;
  useForDump: boolean;
  equipmentItemIds?: number[];
  code?: string;
}
