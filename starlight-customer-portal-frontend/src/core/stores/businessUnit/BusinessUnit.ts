import { action, observable } from 'mobx';

import { convertDates } from '@root/core/helpers';
import { IBusinessLine, IBusinessUnit, JsonConversions } from '@root/core/types';

import { BaseEntity } from '../base/BaseEntity';

import { BusinessUnitStore } from './BusinessUnitStore';

export class BusinessUnit extends BaseEntity implements IBusinessUnit {
  active: boolean;
  mailingAddress: Record<string, any>;
  physicalAddress: Record<string, any>;
  nameLine1: string;
  phone: string;
  timeZoneName: string | null;
  website: string | null;
  email: string | null;
  fax: string | null;
  nameLine2: string | null;
  financeChargeMethod: string | null;
  financeChargeApr: number | null;
  financeChargeMinBalance: number | null;
  financeChargeMinValue: number | null;
  logoUrl?: string | null;

  store: BusinessUnitStore;

  @observable businessLines: IBusinessLine[];

  constructor(store: BusinessUnitStore, entity: JsonConversions<IBusinessUnit>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.logoUrl = entity.logoUrl;
    this.businessLines = entity.businessLines.map(convertDates);
    this.mailingAddress = entity.mailingAddress;
    this.physicalAddress = entity.physicalAddress;
    this.nameLine1 = entity.nameLine1;
    this.nameLine2 = entity.nameLine2;
    this.website = entity.website;
    this.email = entity.email;
    this.phone = entity.phone;
    this.fax = entity.fax;
    this.timeZoneName = entity.timeZoneName;
    this.financeChargeApr = entity.financeChargeApr;
    this.financeChargeMethod = entity.financeChargeMethod;
    this.financeChargeMinBalance = entity.financeChargeMinBalance;
    this.financeChargeMinValue = entity.financeChargeMinValue;
  }

  @action
  setBusinessLines(data: IBusinessLine[]) {
    this.businessLines = data;
  }

  areBusinessLinesChanged(businessLines: IBusinessLine[]): boolean {
    return !!businessLines
      .filter((item) => !this.businessLines.find(({ id: loBId }) => item.id === loBId))
      .map(({ id: loBId }) => loBId).length;
  }
}
