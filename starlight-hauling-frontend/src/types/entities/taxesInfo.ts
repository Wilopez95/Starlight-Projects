import { TaxApplication, TaxCalculation } from '@root/consts';

export type ITaxCalculation = (
  | {
      billableServiceId: number;
      billableLineItemId: undefined;
    }
  | {
      billableLineItemId: number;
      billableServiceId: undefined;
    }
) & {
  districtName: string;
  calculation: TaxCalculation;
  value: number;
  quantity: number;
  calculatedTax: number;
  application: TaxApplication;
  totalPrice?: number;
  proratedTotal?: number;
  materialId?: number;
};

export interface ITaxesInfo {
  taxesTotal: number;
  taxDistrictNames: string[];
  taxCalculations: ITaxCalculation[][];
  recurringTaxesTotal?: number;
}
