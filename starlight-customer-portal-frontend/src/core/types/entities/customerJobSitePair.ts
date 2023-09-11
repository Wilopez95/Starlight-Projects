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
  sendInvoicesToCustomer: boolean | null;
  sendInvoicesToJobSite: boolean | null;
  invoiceEmails: string[] | null;
  taxDistricts?: ITaxDistrict[];
}
