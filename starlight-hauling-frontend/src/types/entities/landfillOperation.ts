import { VersionedEntity } from '../helpers';

import { IBillableService } from './billableService';
import { ICustomer } from './customer';
import { IDisposalSite } from './disposalSite';
import { IEntity } from './entity';
import { IJobSite } from './jobSite';
import { IMaterial } from './material';
import { IWorkOrder } from './workOrder';

export interface ILandfillMaterials {
  id: number;
  description: string;
  value: number;
  mapped: boolean;
  code: string;
}

export interface ILandfillMiscellaneousItems {
  id: number;
  description: string;
  quantity: number;
  mapped: boolean;
  code: string;
}

export type LandfillOperationWeightUnit = 'tons' | 'yards' | 'none';

export interface ILandfillOperation extends IEntity {
  arrivalDate: Date;
  arrivalUseTare: boolean;
  canTare: number;
  departureDate: Date;
  departureUseTare: boolean;
  mappedMaterialId: number | null;
  materialCode: string;
  materialDescription: string;
  materials: ILandfillMaterials[];
  miscellaneousItems: ILandfillMiscellaneousItems[];
  netWeight: number;
  orderId: number;
  origin: string;
  recyclingOrderId: number;
  purchaseOrder: string | null;
  ticketNumber: string;
  ticketUrl: string;
  ticketDate: Date;
  truck: string;
  truckTare: number;
  timeIn: Date;
  timeOut: Date;
  syncDate: Date;
  weightIn: number;
  weightOut: number;
  weightUnit: LandfillOperationWeightUnit;
  mediaFiles: string[];
  recyclingFacility: VersionedEntity<IDisposalSite>;
  workOrder: VersionedEntity<IWorkOrder>;
  customer: VersionedEntity<ICustomer>;
  jobSite: VersionedEntity<IJobSite>;
  billableService: VersionedEntity<IBillableService>;
  material: VersionedEntity<IMaterial>;
}

export interface IEditableLandfillOperation extends IEntity {
  arrivalDate: Date;
  arrivalUseTare: boolean;
  canTare: number;
  truckTare: number;
  departureDate: Date;
  departureUseTare: boolean;
  mappedMaterialId: number | null;
  materialCode: string;
  materialDescription: string;
  materials: ILandfillMaterials[];
  miscellaneousItems: ILandfillMiscellaneousItems[];
  netWeight: number;
  orderId: number;
  origin: string;
  purchaseOrder: string | null;
  ticketNumber: string;
  ticketUrl: string;
  ticketDate: Date;
  recyclingOrderId: number;
  truck: string;
  timeIn: Date;
  timeOut: Date;
  syncDate: Date;
  weightIn: number;
  weightOut: number;
  weightUnit: LandfillOperationWeightUnit;
  mediaFiles: string[];
  recyclingFacility: VersionedEntity<IDisposalSite>;
  workOrder: VersionedEntity<IWorkOrder>;
  customer: VersionedEntity<ICustomer>;
  jobSite: VersionedEntity<IJobSite>;
  billableService: VersionedEntity<IBillableService>;
  material: VersionedEntity<IMaterial>;

  /* UI Props */
  materialsTotal: number;
}
