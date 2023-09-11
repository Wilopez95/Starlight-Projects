import { WorkOrderStatus } from '../consts/workOrder';
import { IEntity } from './Entity';

export interface IWorkOrderMediaFile extends IEntity {
  url: string;
  author: string | null;
  timestamp: Date | null;
  fileName: string;
  fromDispatch: boolean;
}

export type WorkOrderWeightUnit = 'tons' | 'yards';

export interface IWorkOrder extends IEntity {
  woNumber: number;
  route: string | null;
  completionDate: Date | null;
  finishWorkOrderDate: Date | null;
  truckId: number | null;
  driverId: number | null;
  droppedEquipmentItem: string | null;
  pickedUpEquipmentItem: string | null;
  weight: number | null;
  weightUnit: WorkOrderWeightUnit | null;
  startWorkOrderDate: Date | null;
  arriveOnSiteDate: Date | null;
  startServiceDate: Date | null;
  ticket: string | null;
  ticketUrl: string | null;
  ticketAuthor: string | null;
  ticketDate: Date | null;
  ticketFromCsr: boolean;
  mediaFiles: IWorkOrderMediaFile[];
  mediaFilesCount: number;
  driverNotes: null | string;
  syncDate: Date | null;
  status: WorkOrderStatus;
  signatureRequired: boolean;
  permitRequired: boolean;
}
