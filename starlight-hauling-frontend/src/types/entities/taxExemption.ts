import { type IEntity } from './entity';

export interface IBaseTaxExemption extends IEntity {
  enabled: boolean;
  imageUrl: string | null;
  authNumber?: string | null;
  author?: string | null;
  timestamp?: Date | null;
}

export interface INonGroupTaxExemption extends IBaseTaxExemption {
  taxDistrictId: number;
}

export interface ITaxExemption extends IEntity, IBaseTaxExemption {
  nonGroup?: INonGroupTaxExemption[];
}
