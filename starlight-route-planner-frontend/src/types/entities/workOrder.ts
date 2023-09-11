import { IWorkOrderCommentParams } from '@root/api';
import { WorkOrderStatus } from '@root/consts/workOrder';

import { IJobSite, IWeightTicket } from '.';
import { IDailyRoute } from './dailyRoute';
import { IEntity } from './entity';
import { IRouteItem } from './routeItem';

export enum WEIGHT_UNIT_ENUM {
  yards = 'yards',
  tons = 'tons',
  gallons = 'gallons',
}

export enum CancellationReason {
  UserError = 'userError',
  CustomerCanceled = 'customerCanceled',
  Other = 'other',
}

export interface IMedia {
  id: number;
  workOrderId: number;
  url: string;
  timestamp?: string;
  author?: string;
  fileName?: string;
}

export interface IWorkOrder extends IEntity, IRouteItem {
  id: number;
  workOrderId: number;
  // id, used by Hauling to identify a WO (either independant or common one)
  displayId: string;
  orderDisplayId: string;
  isIndependent: boolean;
  serviceDate: string;
  status: WorkOrderStatus;
  customerId: number;
  jobSiteId: number;
  materialId: number;
  equipmentItemId: number;
  orderId: number;
  billableServiceId: number;
  billableServiceDescription: string;
  jobSite: IJobSite;
  signatureRequired: boolean;
  toRoll: boolean;
  alleyPlacement: boolean;
  poRequired: boolean;
  permitRequired: boolean;
  subscriptionId?: number;
  serviceAreaId?: number;
  phoneNumber?: string;
  weightTicket?: IWeightTicket;
  assignedRoute?: string;
  bestTimeToComeFrom?: string;
  bestTimeToComeTo?: string;
  dailyRouteId?: number;
  dailyRoute?: IDailyRoute;
  sequence?: number;
  instructionsForDriver?: string;
  cancellationReason?: CancellationReason;
  cancellationComment?: string;
  completedAt: number | null;
  pickedUpEquipment?: string;
  droppedEquipment?: string;
  weight?: number;
  weightUnit?: WEIGHT_UNIT_ENUM;
  media?: IMedia[];
  comments?: IWorkOrderCommentParams[];
  jobSiteNote?: string;
  someoneOnSite?: boolean;
  highPriority?: boolean;
  thirdPartyHaulerId?: number;
  thirdPartyHaulerDescription?: string;
  equipmentItemSize?: number;
  // For local settings
  checked?: boolean;
}
