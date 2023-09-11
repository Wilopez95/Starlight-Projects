export const enum TaxDistrictType {
  Municipal = 'municipal',
  Secondary = 'secondary',
  Primary = 'primary',
  Country = 'country',
}

export type TaxKey =
  | 'materials'
  | 'services'
  | 'recurringServices'
  | 'lineItems'
  | 'recurringLineItems';

export type TaxGroup =
  | 'commercialMaterials'
  | 'commercialServices'
  | 'commercialRecurringServices'
  | 'commercialLineItems'
  | 'commercialRecurringLineItems'
  | 'nonCommercialMaterials'
  | 'nonCommercialServices'
  | 'nonCommercialRecurringServices'
  | 'nonCommercialLineItems'
  | 'nonCommercialRecurringLineItems';
