import { parseDate } from '@root/helpers';
import { IBusinessUnitInfo, IDriver, ITruckInfo, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { DriverStore } from './DriverStore';

export class Driver extends BaseEntity implements IDriver {
  active: boolean;
  phone: string;
  email: string;
  description: string;
  licenseValidityDate: Date;
  photoUrl: string | null;
  truckId: number;
  workingWeekdays: number[];
  licenseNumber: string;
  licenseType: string;
  businessUnitIds: number[];
  businessUnitNames?: string;
  truck?: ITruckInfo;
  businessUnits?: IBusinessUnitInfo[];
  medicalCardValidityDate?: Date;

  constructor(store: DriverStore, entity: JsonConversions<IDriver>) {
    super(entity);

    this.active = entity.active;
    this.phone = entity.phone;
    this.email = entity.email;
    this.businessUnits = entity.businessUnits;
    this.description = entity.description;
    this.businessUnitNames = entity.businessUnitNames;
    this.photoUrl = entity.photoUrl;
    this.truck = entity.truck;
    this.truckId = entity.truckId;
    this.workingWeekdays = entity.workingWeekdays;
    this.licenseNumber = entity.licenseNumber;
    this.businessUnitIds = entity.businessUnits?.map(bu => bu.id) ?? [];
    this.description = entity.description;
    this.licenseType = entity.licenseType;

    this.createdAt = parseDate(entity.createdAt);
    this.updatedAt = parseDate(entity.updatedAt);
    this.licenseValidityDate = parseDate(entity.licenseValidityDate);
    this.medicalCardValidityDate = entity.medicalCardValidityDate
      ? parseDate(entity.medicalCardValidityDate)
      : undefined;
  }
}
