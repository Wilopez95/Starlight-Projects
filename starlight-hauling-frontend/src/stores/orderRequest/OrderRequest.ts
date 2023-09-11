import { computed } from 'mobx';

import { addressFormatShort, convertDates, substituteLocalTimeZoneInsteadUTC } from '@root/helpers';
import {
  IBillableService,
  IContact,
  IContractor,
  IContractorCustomer,
  IContractorJobSite,
  IMaterial,
  IOrderRequest,
  IPurchaseOrder,
  JsonConversions,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { OrderRequestStore } from './OrderRequestStore';

export class OrderRequest extends BaseEntity implements IOrderRequest {
  materialId: number;
  jobSite2Id: number | null;
  jobSiteId: number;
  equipmentItemId: number;
  customerId: number;
  creditCardId: number | null;
  contractorId?: number;
  billableServiceId: number;
  billableServicePrice: number;
  billableServiceQuantity: number;
  billableServiceApplySurcharges: boolean;
  billableServiceTotal: number;
  grandTotal: number;
  initialGrandTotal: number;
  material: IMaterial;
  billableService: IBillableService;
  contractor?: IContractor;
  contractorContact: IContact;
  customer: IContractorCustomer;
  jobSite: IContractorJobSite;
  driverInstructions: string | null;
  paymentMethod: 'creditCard' | 'onAccount';
  purchaseOrder: IPurchaseOrder | null;
  sendReceipt: boolean;
  serviceDate: Date;
  someoneOnSite: boolean;
  mediaUrls: string[];
  alleyPlacement: boolean;
  status: 'requested';
  serviceAreaId?: number;

  store: OrderRequestStore;

  constructor(store: OrderRequestStore, entity: JsonConversions<IOrderRequest>) {
    super(entity);
    this.store = store;

    this.materialId = entity.materialId;
    this.jobSite2Id = entity.jobSite2Id;
    this.jobSiteId = entity.jobSiteId;
    this.equipmentItemId = entity.equipmentItemId;
    this.customerId = entity.customerId;
    this.creditCardId = entity.creditCardId;
    this.contractorId = entity.contractorId;
    this.billableServiceId = entity.billableServiceId;
    this.billableServicePrice = entity.billableServicePrice;
    this.billableServiceQuantity = entity.billableServiceQuantity;
    this.billableServiceApplySurcharges = entity.billableServiceApplySurcharges;
    this.billableServiceTotal = entity.billableServiceTotal;
    this.grandTotal = entity.grandTotal;
    this.initialGrandTotal = entity.initialGrandTotal;
    this.material = convertDates(entity.material);
    this.billableService = convertDates(entity.billableService);
    this.contractor = entity.contractor ? convertDates(entity.contractor) : undefined;
    this.contractorContact = convertDates(entity.contractorContact);
    this.customer = convertDates(entity.customer);
    this.jobSite = convertDates(entity.jobSite);
    this.driverInstructions = entity.driverInstructions;
    this.paymentMethod = entity.paymentMethod;
    this.purchaseOrder = entity.purchaseOrder
      ? {
          ...convertDates(entity.purchaseOrder),
          effectiveDate: entity.purchaseOrder.effectiveDate
            ? substituteLocalTimeZoneInsteadUTC(entity.purchaseOrder.effectiveDate)
            : null,
        }
      : null;
    this.sendReceipt = entity.sendReceipt;
    this.serviceDate = substituteLocalTimeZoneInsteadUTC(entity.serviceDate);
    this.someoneOnSite = entity.someoneOnSite;
    this.status = entity.status;
    this.alleyPlacement = entity.alleyPlacement;
    this.mediaUrls = entity.mediaUrls;
    this.serviceAreaId = entity.serviceAreaId;
  }

  @computed get billableServiceDescription() {
    if (!this.billableService) {
      return 'No billable service';
    }

    const materialDescription = this.material?.description ? `・ ${this.material.description}` : '';

    return `${this.billableService.description}${materialDescription}`;
  }

  @computed get jobSiteShortAddress() {
    if (!this.jobSite) {
      return '';
    }

    return addressFormatShort(this.jobSite);
  }
}
