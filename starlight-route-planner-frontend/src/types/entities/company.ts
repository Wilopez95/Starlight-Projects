import { IEntity } from './';
import { IAddress } from './address';

export interface ICompany
  extends Omit<IEntity, 'id'>,
    Omit<Partial<IFinanceChargesSettings>, keyof IEntity> {
  companyNameLine1: string;
  phone: string;
  mailingAddress: IAddress;
  physicalAddress: IAddress;
  logoUrl: string | null;
  tenantId: number;
  timeZoneName: string;
  clockIn: boolean;
  companyNameLine2?: string;
  facilityAddress?: string;
  officialWebsite?: string;
  officialEmail?: string;
  fax?: string;
}

export interface IFinanceChargesSettings extends IEntity {
  financeChargeMethod: string;
  financeChargeApr: number;
  financeChargeMinBalance: number;
  financeChargeMinValue: number;
}
