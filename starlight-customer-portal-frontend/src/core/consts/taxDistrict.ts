import { TaxDistrictType } from '@root/core/types/enums';

export const taxDistrictTypes: TaxDistrictType[] = ['city', 'state', 'county'];

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
