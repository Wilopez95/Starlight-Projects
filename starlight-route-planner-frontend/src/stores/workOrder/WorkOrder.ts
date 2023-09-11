import { IWorkOrderCommentParams } from '@root/api';
import { WorkOrderStatus } from '@root/consts/workOrder';
import { convertDates } from '@root/helpers';
import {
  IDailyRoute,
  IJobSite,
  IMedia,
  IWorkOrder,
  JsonConversions,
  CancellationReason,
  WEIGHT_UNIT_ENUM,
} from '@root/types';
import { BaseEntity } from '../base/BaseEntity';
import { WorkOrderStore } from './WorkOrderStore';

export class WorkOrder extends BaseEntity implements IWorkOrder {
  store: WorkOrderStore;
  workOrderId: number;
  isIndependent: boolean;
  orderId: number;
  id: number;
  serviceDate: string;
  status: WorkOrderStatus;
  customerId: number;
  jobSiteId: number;
  businessLineId: number;
  materialId: number;
  equipmentItemId: number;
  subscriptionId?: number;
  billableServiceId: number;
  billableServiceDescription: string;
  jobSite: IJobSite;
  signatureRequired: boolean;
  toRoll: boolean;
  alleyPlacement: boolean;
  poRequired: boolean;
  permitRequired: boolean;
  displayId: string;
  orderDisplayId: string;
  phoneNumber?: string;
  assignedRoute?: string;
  bestTimeToComeFrom?: string;
  bestTimeToComeTo?: string;
  dailyRouteId?: number;
  dailyRoute?: IDailyRoute;
  sequence?: number;
  comments?: IWorkOrderCommentParams[];
  instructionsForDriver?: string;
  cancellationReason?: CancellationReason;
  cancellationComment?: string;
  completedAt: number | null;
  pickedUpEquipment?: string;
  droppedEquipment?: string;
  weight?: number;
  weightUnit?: WEIGHT_UNIT_ENUM;
  media?: IMedia[];
  jobSiteNote?: string;
  someoneOnSite?: boolean;
  highPriority?: boolean;
  thirdPartyHaulerId?: number;
  thirdPartyHaulerDescription?: string;

  constructor(store: WorkOrderStore, entity: JsonConversions<IWorkOrder>) {
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
    this.subscriptionId = entity.subscriptionId;
    this.billableServiceId = entity.billableServiceId;
    this.billableServiceDescription = entity.billableServiceDescription;
    this.jobSite = entity.jobSite;
    this.signatureRequired = entity.signatureRequired;
    this.toRoll = entity.toRoll;
    this.alleyPlacement = entity.alleyPlacement;
    this.poRequired = entity.poRequired;
    this.permitRequired = entity.permitRequired;
    this.assignedRoute = entity.assignedRoute;
    this.bestTimeToComeFrom = entity.bestTimeToComeFrom;
    this.bestTimeToComeTo = entity.bestTimeToComeTo;
    this.dailyRouteId = entity.dailyRouteId;
    this.dailyRoute = convertDates(entity.dailyRoute);
    this.sequence = entity.sequence;
    this.instructionsForDriver = entity.instructionsForDriver;
    this.cancellationReason = entity.cancellationReason;
    this.cancellationComment = entity.cancellationComment;
    this.completedAt = entity.completedAt;
    this.pickedUpEquipment = entity.pickedUpEquipment;
    this.droppedEquipment = entity.droppedEquipment;
    this.weight = entity.weight;
    this.weightUnit = entity.weightUnit;
    this.media = entity.media;
    this.jobSiteNote = entity.jobSiteNote;
    this.someoneOnSite = entity.someoneOnSite;
    this.highPriority = entity.highPriority;
    this.thirdPartyHaulerId = entity.thirdPartyHaulerId;
    this.comments = entity.comments?.map(convertDates);
    this.thirdPartyHaulerDescription = entity.thirdPartyHaulerDescription;
    this.phoneNumber = entity.phoneNumber;
    this.displayId = entity.displayId;
  }
}
