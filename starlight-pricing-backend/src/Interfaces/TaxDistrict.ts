import { IEntity } from './Entity';

export interface ITaxDistrict extends IEntity {
  active: boolean;
  description: string;
  districtType: string;
  includeNationalInTaxableAmount: boolean;
  useGeneratedDescription: boolean;
  taxesPerCustomerType: boolean;
  bbox?: number[];
  businessLineTaxesIds?: number[];
  districtCode?: string;
  districtName?: string;
  taxDescription?: string | null;
}
