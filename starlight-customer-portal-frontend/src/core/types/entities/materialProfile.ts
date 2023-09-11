import { IEntity } from './';

export interface IMaterialProfile extends IEntity {
  active: boolean;
  description: string;
  materialId: number;
  disposalSiteId: number;
  expirationDate: Date | null;
  businessLineId: string;
  materialDescription?: string;
  disposalSiteDescription?: string;
}
