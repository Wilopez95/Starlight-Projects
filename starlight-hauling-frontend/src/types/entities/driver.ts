import { FileWithPreview } from '..';

import { IBusinessUnitInfo } from '.';
import { IEntity } from './entity';

export interface ITruckInfo {
  id: number;
  description: string;
}

export interface IDriver extends IEntity {
  active: boolean;
  phone: string;
  email: string;
  description: string;
  photoUrl: string | null;
  truckId: number;
  workingWeekdays: number[];
  licenseNumber: string;
  businessUnitIds: number[];
  licenseType: string;
  businessUnitNames?: string;
  truck?: ITruckInfo;
  businessUnits?: IBusinessUnitInfo[];
  licenseValidityDate?: Date;
  medicalCardValidityDate?: Date;
}

export type IDriverFormikData = Omit<
  IDriver,
  'truckId' | 'photoUrl' | 'email' | 'createdAt' | 'updatedAt'
> & {
  truckId?: number;
  email?: string;
  image?: FileWithPreview | null;
  photoUrl?: string | null;
};
