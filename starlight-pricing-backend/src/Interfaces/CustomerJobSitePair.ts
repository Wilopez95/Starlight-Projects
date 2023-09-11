import { IEntity } from './Entity';
import { IPurchaseOrder } from './PurchaseOrder';
import { ITaxDistrict } from './TaxDistrict';

export interface ICustomerJobSitePair extends IEntity {
  active: boolean;
  jobSiteId: number;
  customerId: number;
  popupNote: string | null;
  poRequired: boolean | null;
  permitRequired: boolean | null;
  signatureRequired: boolean | null;
  alleyPlacement: boolean | null;
  cabOver: boolean | null;
  sendInvoicesToJobSite: boolean | null;
  workOrderNotes?: string | null;
  invoiceEmails?: string[] | null;
  defaultPurchaseOrders?: number[] | null;
  purchaseOrders?: IPurchaseOrder[];
  taxDistricts?: ITaxDistrict[];
}
