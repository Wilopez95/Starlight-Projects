import { IPurchaseOrder } from '@root/types';

import { IEntity } from './entity';
import { ITaxDistrict } from './taxDistrict';

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
