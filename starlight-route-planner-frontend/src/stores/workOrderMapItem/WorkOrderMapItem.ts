import { WorkOrderStatus } from '@root/consts/workOrder';
import { IJobSite, JsonConversions } from '@root/types';

import { BaseEntity } from '../base/BaseEntity';

import { IWorkOrderMapItem } from './types';
import { WorkOrderMapItemStore } from './WorkOrderMapItemStore';

export class WorkOrderMapItem extends BaseEntity implements IWorkOrderMapItem {
  store: WorkOrderMapItemStore;
  id: number;
  workOrderId: number;
  isIndependent: boolean;
  orderId: number;
  serviceDate: string;
  displayId: string;
  orderDisplayId: string;
  status: WorkOrderStatus;
  customerId: number;
  jobSiteId: number;
  materialId: number;
  equipmentItemId: number;
  businessLineId: number;
  jobSite: IJobSite;
  billableServiceId: number;
  billableServiceDescription: string;
  dailyRouteId?: number;
  subscriptionId?: number;
  assignedRoute?: string;
  bestTimeToComeFrom?: string;
  bestTimeToComeTo?: string;
  sequence?: number;

  constructor(store: WorkOrderMapItemStore, entity: JsonConversions<IWorkOrderMapItem>) {
    super(entity);

    this.store = store;
    this.id = entity.id;
    this.workOrderId = entity.workOrderId;
    this.isIndependent = entity.isIndependent;
    this.orderId = entity.orderId;
    this.orderDisplayId = entity.orderDisplayId;
    this.serviceDate = entity.serviceDate;
    this.status = entity.status;
    this.customerId = entity.customerId;
    this.jobSiteId = entity.jobSiteId;
    this.businessLineId = entity.businessLineId;
    this.materialId = entity.materialId;
    this.equipmentItemId = entity.equipmentItemId;
    this.dailyRouteId = entity.dailyRouteId;
    this.subscriptionId = entity.subscriptionId;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.billableServiceId = entity.billableServiceId;
    this.billableServiceDescription = entity.billableServiceDescription;
    this.jobSite = entity.jobSite;
    this.sequence = entity.sequence;
    this.assignedRoute = entity.assignedRoute;
    this.displayId = entity.displayId;
  }
}
