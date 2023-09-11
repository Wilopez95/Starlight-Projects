import type { IAddress } from './address';
import type { IEntity } from './index';

export interface ICompany extends IEntity, Omit<Partial<IFinanceChargesSettings>, keyof IEntity> {
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

export interface IMailSettings extends IEntity {
  adminEmail: string;
  notificationEmails: string[];
  domainId: number | null;

  statementsFrom: string | null;
  statementsReplyTo: string | null;
  statementsSendCopyTo: string | null;
  statementsSubject: string | null;
  statementsBody: string | null;
  statementsDisclaimerText: string | null;

  invoicesFrom: string | null;
  invoicesReplyTo: string | null;
  invoicesSendCopyTo: string | null;
  invoicesSubject: string | null;
  invoicesBody: string | null;
  invoicesDisclaimerText: string | null;
}

export interface IFinanceChargesSettings extends IEntity {
  financeChargeMethod: string;
  financeChargeApr: number;
  financeChargeMinBalance: number;
  financeChargeMinValue: number;
}

export interface IGeneralSettings extends IEntity {
  timeZoneName: string;
  clockIn: boolean;
}

export enum FinanceChargeMethod {
  daysPeriod30 = 'daysPeriod30',
  days = 'days',
}

export type companyAdditionalInfo = 'companyNameLine1' | 'companyNameLine2' | 'logoUrl';

export type LogoInformation = Pick<ICompany, companyAdditionalInfo>;
