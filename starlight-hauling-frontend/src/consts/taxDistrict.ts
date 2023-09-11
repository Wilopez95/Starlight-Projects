import { TaxDistrictType } from '@root/types/enums';

export const taxDistrictTypes: TaxDistrictType[] = [
  TaxDistrictType.Municipal,
  TaxDistrictType.Secondary,
  TaxDistrictType.Primary,
  TaxDistrictType.Country,
];

export const enum TaxCalculation {
  Flat = 'flat',
  Percentage = 'percentage',
}

export const enum TaxApplication {
  Order = 'order',
  Ton = 'ton',
  Quantity = 'quantity',
  Each = 'each',
  Subscription = 'subscription',
}
