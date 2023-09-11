import { TaxApplication, TaxCalculation } from '@root/consts';
import { IEntity } from '.';
import { TaxDistrictType } from '../enums';
type Id = number;

export interface GroupTax {
  group: true;
  value: string;
  exclusions: Id[];
}

export type GroupLineItemTax = Omit<GroupTax, 'exclusions'> & {
  exclusions: { thresholds: Id[]; lineItems: Id[] };
};

export type NonGroupTaxValue = { id: Id; value: string }[];

export interface NonGroupTax {
  group: false;
  value?: undefined;
  nonGroup: NonGroupTaxValue;
}

export type NonGroupLineItemTax = Omit<NonGroupTax, 'nonGroup'> & {
  nonGroup: { thresholds: NonGroupTaxValue; lineItems: NonGroupTaxValue };
};

type MaybeGroupTax = GroupTax | NonGroupTax;
type MaybeGroupLineItemTax = GroupLineItemTax | NonGroupLineItemTax;

interface PercentageTax {
  calculation: TaxCalculation.Percentage;
  application: null;
}

export interface FlatTax {
  calculation: TaxCalculation.Flat;
  application: TaxApplication;
}

export type PercentageOrFlatTax = PercentageTax | FlatTax;

export type Tax = PercentageOrFlatTax & MaybeGroupTax;
export type LineItemTax = PercentageOrFlatTax & MaybeGroupLineItemTax;

export type UpdateTax = (Tax | LineItemTax) & {
  businessLineId: number;
  commercial: boolean;
};

export interface IBusinessConfig {
  id: number;
  commercialLineItems: LineItemTax;
  commercialMaterials: Tax;
  commercialRecurringLineItems: Tax;
  commercialRecurringServices: Tax;
  commercialServices: Tax;
  nonCommercialLineItems: LineItemTax;
  nonCommercialMaterials: Tax;
  nonCommercialRecurringLineItems: Tax;
  nonCommercialRecurringServices: Tax;
  nonCommercialServices: Tax;
  businessLineId: number;
}

export interface ITaxDistrict extends IEntity {
  active: boolean;
  description: string;
  districtType: TaxDistrictType;
  includeNationalInTaxableAmount: boolean;
  useGeneratedDescription: boolean;
  taxesPerCustomerType: boolean;
  businessConfiguration: IBusinessConfig[];
  bbox?: number[];
  businessLineTaxesIds?: number[];
  districtCode?: string;
  districtName?: string;
  taxDescription?: string | null;
}
