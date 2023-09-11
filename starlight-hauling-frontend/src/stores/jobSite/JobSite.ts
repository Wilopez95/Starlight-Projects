import { Point } from 'geojson';
import { computed, observable } from 'mobx';

import { addressFormat, addressFormatShort } from '@root/helpers';
import { type IAddress, type IJobSite, type ITaxDistrict, type JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { JobSiteStore } from './JobSiteStore';

export class JobSite extends BaseEntity implements IJobSite {
  name?: string;
  address: IAddress;
  location: Point;
  alleyPlacement: boolean;
  cabOver: boolean;
  recyclingDefault: boolean;
  taxDistricts?: ITaxDistrict[];
  taxDistrictsCount?: number;
  polygon?: { coordinates: GeoJSON.Position[][] };
  radius?: number;
  contactId?: number;
  @observable active?: boolean;

  store: JobSiteStore;

  constructor(store: JobSiteStore, entity: JsonConversions<IJobSite>) {
    super(entity);

    this.store = store;
    this.active = entity.active;
    this.name = entity.name ?? undefined;
    this.address = entity.address;
    this.location = entity.location;
    this.alleyPlacement = entity.alleyPlacement;
    this.cabOver = entity.cabOver;
    this.recyclingDefault = entity.recyclingDefault;
    this.taxDistrictsCount = entity.taxDistricts
      ? entity.taxDistricts.length
      : entity.taxDistrictsCount;
    this.taxDistricts = entity.taxDistricts?.map(district => ({
      ...district,
      createdAt: new Date(district.createdAt),
      updatedAt: new Date(district.updatedAt),
    }));
    this.radius = entity.radius;
    this.polygon = entity.polygon as { coordinates: GeoJSON.Position[][] };
    this.contactId = entity.contactId;
  }

  @computed get shortAddress() {
    return addressFormatShort(this.address);
  }

  @computed get fullAddress() {
    return addressFormat(this.address);
  }

  @computed get displayName() {
    return this.name ?? addressFormat(this.address);
  }
}
