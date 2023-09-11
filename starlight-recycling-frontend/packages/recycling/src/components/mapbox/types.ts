export enum TaxDistrictType {
  Municipal = 'municipal',
  Secondary = 'secondary',
  Primary = 'primary',
  Country = 'country',
}

export const layersMapUsToGeneral = {
  state: TaxDistrictType.Primary,
  county: TaxDistrictType.Secondary,
  city: TaxDistrictType.Municipal,
  country: TaxDistrictType.Country,
};
