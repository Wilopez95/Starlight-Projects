import { FileWithPreview, IBusinessLine, IEntity } from '@root/types';

export enum BusinessUnitType {
  RECYCLING_FACILITY = 'recyclingFacility',
  HAULING = 'hauling',
}

interface PhysicalAddress {
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  zip?: string;
}

interface MailingAddress {
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  zip?: string;
}

export interface IBusinessUnit extends IEntity {
  active: boolean;
  businessLines: IBusinessLine[];
  mailingAddress: Record<string, MailingAddress>;
  physicalAddress: Record<string, PhysicalAddress>;
  nameLine1: string;
  phone: string;
  timeZoneName: string | null;
  website: string | null;
  fax: string | null;
  nameLine2: string | null;
  email: string | null;
  financeChargeMethod: string | null;
  financeChargeApr: number | null;
  financeChargeMinBalance: number | null;
  financeChargeMinValue: number | null;
  businessLinesIds?: number[];
  logoUrl?: string | null;
  logo?: FileWithPreview;
}
