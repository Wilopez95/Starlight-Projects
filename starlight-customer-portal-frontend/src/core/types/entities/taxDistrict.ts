import { TaxApplication, TaxCalculation } from '@root/core/consts';

import { TaxDistrictType } from '../enums';

import { IEntity } from './entity';

type Id = number;

export interface GroupTax {
  group: true;
  value: string;
  exclusions: Id[];
}

export interface NonGroupTax {
  group: false;
  value?: undefined;
  nonGroup: {
    id: Id;
    value: string;
  }[];
}

type MaybeGroupedTax = GroupTax | NonGroupTax;

interface PercentageTax {
  calculation: TaxCalculation.Percentage;
  application: null;
}

export interface FlatTax {
  calculation: TaxCalculation.Flat;
  application: TaxApplication;
}

export type PercentageOrFlatTax = PercentageTax | FlatTax;

export type Tax = PercentageOrFlatTax & MaybeGroupedTax;

export type UpdateTax = Tax & {
  businessLineId: number;
};

export interface IBusinessConfig {
  id: number;
  lineItems: Tax;
  materials: Tax;
  recurringLineItems: Tax;
  recurringServices: Tax;
  services: Tax;
  businessLineId: number;
}

export interface ITaxDistrict extends IEntity {
  active: boolean;
  description: string;
  districtType: TaxDistrictType;
  businessConfiguration: IBusinessConfig[];
  bbox?: number[];
  businessLineTaxesIds?: number[];
  districtCode?: string;
  districtName?: string;
  taxDescription?: string | null;
}
