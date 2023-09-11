import { IBillableService, IEntity, IMaterial } from '@root/types';

export interface IThirdPartyHaulerCostsResponse extends IEntity {
  businessLineId: number;
  thirdPartyHaulerId: number;
  cost: string;
  billableServiceId: number;
  billableService: IBillableService;
  materialId: number | null;
  material: IMaterial | null;
}

export interface IThirdPartyHaulerCostsPayload {
  businessLineId: number;
  materialId: number | null;
  cost: string | null;
  billableServiceId: number;
}
