import { computed } from 'mobx';

import { FileGalleryMediaItem } from '@root/common/FilePreview/FilesGallery/types';
import { convertDates, parseDate, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  IBillableService,
  ICustomer,
  IDisposalSite,
  IJobSite,
  ILandfillMaterials,
  ILandfillMiscellaneousItems,
  ILandfillOperation,
  IMaterial,
  IWorkOrder,
  JsonConversions,
  LandfillOperationWeightUnit,
  VersionedEntity,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { LandfillOperationStore } from './LandfillOperationStore';

export class LandfillOperation extends BaseEntity implements ILandfillOperation {
  orderId: number;
  ticketNumber: string;
  ticketUrl: string;
  ticketDate: Date;
  truck: string;
  timeIn: Date;
  timeOut: Date;
  netWeight: number;
  syncDate: Date;
  weightIn: number;
  weightOut: number;
  weightUnit: LandfillOperationWeightUnit;
  mediaFiles: string[];

  recyclingOrderId: number;
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
  origin: string;
  purchaseOrder: string | null;

  recyclingFacility: VersionedEntity<IDisposalSite>;
  workOrder: VersionedEntity<IWorkOrder>;
  customer: VersionedEntity<ICustomer>;
  jobSite: VersionedEntity<IJobSite>;
  billableService: VersionedEntity<IBillableService>;
  material: VersionedEntity<IMaterial>;

  store: LandfillOperationStore;

  constructor(store: LandfillOperationStore, entity: JsonConversions<ILandfillOperation>) {
    super(entity);
    this.store = store;
    this.id = entity.id;
    this.orderId = entity.orderId;
    this.ticketUrl = entity.ticketUrl;

    this.netWeight = entity.netWeight;
    this.canTare = entity.canTare;
    this.mappedMaterialId = entity.mappedMaterialId;
    this.materialCode = entity.materialCode;
    this.materialDescription = entity.materialDescription;
    this.recyclingOrderId = entity.recyclingOrderId;
    this.weightIn = entity.weightIn;
    this.weightOut = entity.weightOut;
    this.weightUnit = entity.weightUnit;
    this.mediaFiles = entity.mediaFiles;
    this.truckTare = entity.truckTare;

    this.ticketDate = substituteLocalTimeZoneInsteadUTC(entity.ticketDate);
    this.syncDate = parseDate(entity.syncDate);
    this.recyclingFacility = convertDates(entity.recyclingFacility);
    this.workOrder = convertDates(entity.workOrder);
    this.customer = convertDates(entity.customer);
    this.jobSite = convertDates(entity.jobSite);
    this.billableService = convertDates(entity.billableService);
    this.material = convertDates(entity.material);
    this.timeIn = parseDate(entity.arrivalDate);
    this.timeOut = parseDate(entity.departureDate);
    this.arrivalDate = parseDate(entity.arrivalDate);
    this.departureDate = parseDate(entity.departureDate);

    this.truck = entity.truck ?? '';
    this.origin = entity.origin ?? '';
    this.ticketNumber = entity.ticketNumber ?? '';
    this.arrivalUseTare = entity.arrivalUseTare ?? false;
    this.departureUseTare = entity.departureUseTare ?? false;
    this.purchaseOrder = entity.purchaseOrder ?? '';
    this.materials = entity.materials ?? [];
    this.miscellaneousItems = entity.miscellaneousItems ?? [];
  }

  @computed
  get mediaFilesData() {
    const files: FileGalleryMediaItem[] = [];

    if (this.ticketUrl) {
      files.push({
        src: this.ticketUrl,
        category: 'Ticket',
        fileName: `Ticket from Landfill Operation # ${this.id}`,
        author: this.workOrder.ticketAuthor,
        timestamp: this.ticketDate ?? undefined,
      });
    }

    return files;
  }
}
