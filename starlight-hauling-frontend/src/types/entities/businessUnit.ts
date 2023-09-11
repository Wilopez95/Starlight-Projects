import {
  type FileWithPreview,
  type IAddress,
  type IBusinessLine,
  type IEntity,
  type IMerchant,
  type IServiceDaysAndTime,
} from '@root/types';

export enum BusinessUnitType {
  RECYCLING_FACILITY = 'recyclingFacility',
  HAULING = 'hauling',
}

export interface IBusinessUnit extends IEntity {
  active: boolean;
  type: BusinessUnitType;
  businessLines: IBusinessLine[];
  mailingAddress: IAddress;
  physicalAddress: IAddress;
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
  applySurcharges: boolean;
  printNodeApiKey: string | null;
  spUsed: boolean;
  logoUrl?: string | null;
  logo?: FileWithPreview;
  merchant?: IMerchant | null;
  coordinates: number[] | null;
  requireDestinationOnWeightOut?: boolean;
  requireOriginOfInboundLoads?: boolean;
}

export interface IBusinessUnitWithServiceDays extends IBusinessUnit {
  serviceDays: IServiceDaysAndTime[] | null;
}
