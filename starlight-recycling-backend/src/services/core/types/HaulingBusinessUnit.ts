export interface HaulingBusinessUnit {
  id: number;
  logoUrl: string;
  nameLine1: string;
  nameLine2: string;
  phone: string;
  fax: string;
  facilityAddress: string | null;
  website: string | null;
  email: string | null;
  physicalAddressLine1: string;
  physicalAddressLine2: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingCity: string;
  mailingState: string;
  mailingZip: string;
  timeZoneName: string;
}
