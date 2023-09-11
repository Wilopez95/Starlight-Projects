import { Geometry } from 'geojson';

export interface HaulingJobSite {
  id: number;
  originalId: number;
  fullAddress: string;
  location: Geometry;
  address: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    county: string | null;
    zip: string;
    region: string;
  };
  alleyPlacement: boolean;
  popupNote: string;
  cabOver: boolean;
}
