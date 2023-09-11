import { BusinessLineTypeSymbol, DriverTruckRouteViolation, MasterRouteStatus } from '@root/consts';
import { convertDates } from '@root/helpers';
import { IMasterRoute, IMasterRouteServiceItem, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { MasterRoutesStore } from './MasterRoutesStore';

export class MasterRouteItem extends BaseEntity implements IMasterRoute {
  assignedServiceDaysList: number[];
  businessUnitId: number | undefined;
  color: string;
  driverId: number | undefined;
  id: number;
  name: string;
  status?: MasterRouteStatus;
  publishDate: string | null | undefined;
  truckId: string | undefined;
  serviceDaysList: number[];
  serviceItems: IMasterRouteServiceItem[];
  published: boolean;
  businessLineType?: BusinessLineTypeSymbol;
  editingBy?: string | null;
  editorId?: string | null;
  violation?: DriverTruckRouteViolation[];
  checked?: boolean;

  store: MasterRoutesStore;

  constructor(store: MasterRoutesStore, entity: JsonConversions<IMasterRoute>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.name = entity.name;
    this.businessUnitId = entity.businessUnitId;
    this.color = entity.color;
    this.businessLineType = entity.businessLineType;
    this.driverId = entity.driverId;
    this.status = entity.status;
    this.publishDate = entity.publishDate;
    this.truckId = entity.truckId;
    this.serviceDaysList = entity.serviceDaysList;
    this.serviceItems = entity.serviceItems
      .map(convertDates)
      .sort((a, b) => a.sequence - b.sequence);
    this.published = entity.published;
    this.assignedServiceDaysList = entity.assignedServiceDaysList;
    this.editingBy = entity.editingBy;
    this.editorId = entity.editorId;
    this.violation = entity.violation;
    this.checked = entity.checked;
  }
}
