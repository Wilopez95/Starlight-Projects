export interface IAddress {
  // TODO: I don't think any address on BE has ID field; remove later.
  id: number;
  addressLine1: string;
  addressLine2: string | null;
  state: string;
  city: string;
  zip: string;
}
