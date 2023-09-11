export interface IAddress {
  id: number;
  addressLine1: string;
  addressLine2: string | null;
  state: string;
  city: string;
  zip: string;
  region: string;
}
