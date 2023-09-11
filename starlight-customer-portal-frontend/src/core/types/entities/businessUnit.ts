import type { FileWithPreview, IBusinessLine, IEntity } from '@root/core/types';

export interface IBusinessUnit extends IEntity {
  active: boolean;
  businessLines: IBusinessLine[];
  mailingAddress: Record<string, any>;
  physicalAddress: Record<string, any>;
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
