import { IEntity, ILineItem, IMaterial } from '@root/types';

export interface IMaterialCodePayload {
  businessLineId: string;
  materialId: string;
  recyclingMaterialCode: string | null;
  recyclingMaterialDescription: string;
  recyclingMaterialId: string | null;
  billableLineItemId: string | null;
}

export interface IDisposalRatePayload {
  businessLineId: string;
  materialId: string;
  rate: number | null;
  unit: string;
}

export interface IMaterialCodeResponse extends IMaterialCodePayload, IEntity {
  billableLineItem: ILineItem | null;
  material: IMaterial;
}

export interface IDisposalRateResponse extends IEntity {
  businessLineId: string;
  materialId: string;
  material: IMaterial;
  rate: number;
  unit: string;
}

export interface IRecyclingCode {
  id: number;
  active: boolean;
  description: string;
  code: string;
}

export interface IRecyclingCodesResponse {
  data: {
    materials: {
      data: IRecyclingCode[];
      total: number;
    };
  };
}
