import { IBillableService, IContact, ICustomer, IEntity, IMaterial, IPurchaseOrder } from '.';
import { IAddress } from './address';

type OrderRequestPaymentMethod = 'creditCard' | 'onAccount';

export interface IOrderRequest extends IEntity {
  /** Ids */
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
  billableServiceTotal: number;
  billableServiceApplySurcharges: boolean;

  grandTotal: number;
  initialGrandTotal: number;

  material: IMaterial;
  billableService: IBillableService;
  contractor?: IContractor;
  contractorContact: IContact;
  customer: IContractorCustomer;
  jobSite: IContractorJobSite;

  alleyPlacement: boolean;
  driverInstructions: string | null;
  paymentMethod: OrderRequestPaymentMethod;
  purchaseOrder: IPurchaseOrder | null;
  sendReceipt: boolean;
  serviceDate: Date;
  someoneOnSite: boolean;
  status: 'requested';
  mediaUrls: string[];
  serviceAreaId?: number;
}

export interface IContractor extends IEntity {
  businessUnitId: number;
  contactId: number;
  customerId: number;
  email: string;
  imageUrl: string;
  mobile: string;
  tocAccepted: boolean;
}

export interface IContractorCustomer extends Omit<ICustomer, 'billingAddress' | 'mailingAddress'> {
  billingAddressLine1: string;
  billingAddressLine2: string | null;
  billingCity: string;
  billingState: string;
  billingZip: string;

  mailingAddressLine1: string;
  mailingAddressLine2: string | null;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
}

export interface IContractorJobSite extends IEntity, IAddress {
  alleyPlacement: boolean;
  cabOver: boolean;
  contactId: number;
  location: string;
  media: string[];
  purchaseOrder: string;
}
