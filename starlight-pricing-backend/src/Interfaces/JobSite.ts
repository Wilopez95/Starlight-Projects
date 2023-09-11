import { IAddress } from './Address';
import { ICustomer } from './Customer';
import { ICustomerJobSitePair } from './CustomerJobSite';
import { ITaxDistrict } from './TaxDistrict';

export interface Point {
  type: 'Point';
  coordinates: number[];
}

export interface IJobSite {
  name?: string;
  address: IAddress;
  location: Point;
  alleyPlacement: boolean;
  cabOver: boolean;
  recyclingDefault: boolean;
  taxDistricts?: ITaxDistrict[];
  taxDistrictsCount?: number;
  polygon?: { coordinates: number[] };
  radius?: number;
  contactId?: number;
  originalId?: number;
  fullAddress?: string;
}

export interface IGetJobSiteDataResponse extends ICustomerJobSitePair {
  jobSite: IJobSite;
  customer: ICustomer;
}

export interface IGetJobSiteData {
  customerJobSite: IGetJobSiteDataResponse;
}

export interface IGetJobSiteDataParams {
  customerJobSiteId: number;
}

export interface IGetJobSiteDataData {
  data: IGetJobSiteDataParams;
}

export interface IJobSiteAddress {
  id?: number;
  zip?: string;
  state?: string;
  city?: string;
  fullAddress?: string;
  addressLine1?: string;
  addressLine2?: string | null;
}
