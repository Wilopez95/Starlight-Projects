import { sortBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { BusinessUnitService } from '@root/api';
import { convertDates } from '@root/helpers';
import {
  BusinessUnitType,
  IAddress,
  IBusinessLine,
  IBusinessUnit,
  IBusinessUnitWithServiceDays,
  IMerchant,
  IServiceDaysAndTime,
  JsonConversions,
} from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { BusinessUnitStore } from './BusinessUnitStore';

export class BusinessUnit extends BaseEntity implements IBusinessUnitWithServiceDays {
  active: boolean;
  mailingAddress: IAddress;
  physicalAddress: IAddress;
  coordinates: number[] | null;
  nameLine1: string;
  phone: string;
  type: BusinessUnitType;
  applySurcharges: boolean;
  timeZoneName: string | null;
  website: string | null;
  email: string | null;
  fax: string | null;
  nameLine2: string | null;
  financeChargeMethod: string | null;
  financeChargeApr: number | null;
  financeChargeMinBalance: number | null;
  financeChargeMinValue: number | null;
  printNodeApiKey: string | null;
  spUsed: boolean;
  logoUrl?: string | null;
  merchant?: IMerchant | null;
  requireDestinationOnWeightOut?: boolean;
  requireOriginOfInboundLoads?: boolean;
  serviceDays: IServiceDaysAndTime[] | null;
  store: BusinessUnitStore;

  @observable businessLines: IBusinessLine[];

  constructor(store: BusinessUnitStore, entity: JsonConversions<IBusinessUnit>) {
    super(entity);

    this.store = store;

    this.type = entity.type;
    this.active = entity.active;
    this.logoUrl = entity.logoUrl;
    this.businessLines = entity.businessLines.map(convertDates);
    this.mailingAddress = entity.mailingAddress;
    this.physicalAddress = entity.physicalAddress;
    this.coordinates = entity.coordinates;
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
    this.applySurcharges = entity.applySurcharges;
    this.requireDestinationOnWeightOut = entity.requireDestinationOnWeightOut;
    this.requireOriginOfInboundLoads = entity.requireOriginOfInboundLoads;
    this.serviceDays = null;

    this.printNodeApiKey = entity.printNodeApiKey;
    this.merchant = convertDates(entity.merchant);
    this.spUsed = entity.spUsed;
  }

  @action
  setBusinessLines(data: IBusinessLine[]) {
    this.businessLines = data;
  }

  areBusinessLinesChanged(businessLines: IBusinessLine[]): boolean {
    return !!businessLines
      .filter(item => !this.businessLines.find(({ id: loBId }) => item.id === loBId))
      .map(({ id: loBId }) => loBId).length;
  }

  @computed
  get fullName() {
    const nameLine2 = this.nameLine2 ? ` ${this.nameLine2}` : '';

    return `${this.nameLine1}${nameLine2}`;
  }

  @actionAsync
  async getServiceDays() {
    if (this.type === BusinessUnitType.RECYCLING_FACILITY) {
      const responseData = await task(BusinessUnitService.getServiceDays(this.id));

      this.serviceDays = responseData?.length ? sortBy(responseData, ['dayOfWeek']) : null;
    }
  }
}
