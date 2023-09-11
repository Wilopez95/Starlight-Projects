import { Regions } from '@root/i18n/config/region';
import { Units } from '@root/i18n/config/units';

import { type IEntity } from './';
import { type IAddress } from './address';

export interface ICompany extends IEntity, Omit<Partial<IFinanceChargesSettings>, keyof IEntity> {
  companyNameLine1: string;
  phone: string;
  mailingAddress: IAddress;
  physicalAddress: IAddress;
  logoUrl: string | null;
  tenantId: number;
  timeZoneName: string;
  clockIn: boolean;
  unit: Units;
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

  invoicesFrom: string | null;
  invoicesReplyTo: string | null;
  invoicesSendCopyTo: string | null;
  invoicesSubject: string | null;
  invoicesBody: string | null;
  invoicesDisclaimerText: string | null;

  receiptsFrom: string | null;
  receiptsReplyTo: string | null;
  receiptsSendCopyTo: string | null;
  receiptsSubject: string | null;
  receiptsBody: string | null;
  receiptsDisclaimerText: string | null;

  servicesFrom: string | null;
  servicesReplyTo: string | null;
  servicesSendCopyTo: string | null;
  servicesSubject: string | null;
  servicesBody: string | null;

  statementsFrom: string | null;
  statementsReplyTo: string | null;
  statementsSendCopyTo: string | null;
  statementsSubject: string | null;
  statementsBody: string | null;
  statementsDisclaimerText: string | null;

  subscriptionsEndFrom: string | null;
  subscriptionsEndSubject: string | null;
  subscriptionsEndBody: string | null;

  subscriptionsResumeFrom: string | null;
  subscriptionsResumeSubject: string | null;
  subscriptionsResumeBody: string | null;

  weightTicketFrom: string | null;
  weightTicketReplyTo: string | null;
  weightTicketSendCopyTo: string | null;
  weightTicketSubject: string | null;
  weightTicketBody: string | null;

  customerOnHoldFrom: string | null;
  customerOnHoldSubject: string | null;
  customerOnHoldBody: string | null;
}

export interface IFinanceChargesSettings {
  id?: number;
  financeChargeMethod?: string;
  financeChargeApr?: number;
  financeChargeMinBalance?: number;
  financeChargeMinValue?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IGeneralSettings extends IEntity {
  timeZoneName: string;
  clockIn: boolean;
  region: Regions;
  unit: string;
}

export enum FinanceChargeMethod {
  daysPeriod30 = 'daysPeriod30',
  days = 'days',
}

export type LogoInformation = Pick<ICompany, 'companyNameLine1' | 'companyNameLine2' | 'logoUrl'>;
