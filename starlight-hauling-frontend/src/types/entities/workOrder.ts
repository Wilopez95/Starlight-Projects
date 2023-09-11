import { type WorkOrderStatus } from '@root/consts';

import { type FileWithPreview } from '../base/file';

import { type IEntity } from './entity';

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

export interface IEditableWorkOrder {
  woNumber: string;
  route: string;
  droppedEquipmentItem: string;
  pickedUpEquipmentItem: string;
  weight: string;
  weightUnit: WorkOrderWeightUnit;
  ticketAuthor: string;
  ticket: string | null;
  ticketUrl: string | null;
  ticketFromCsr: boolean;
  mediaFiles: (IWorkOrderMediaFile | FileWithPreview)[];
  driverNotes: string;
  status: WorkOrderStatus;

  truckId?: number;
  driverId?: number | string;
  completionDate?: Date;
  startWorkOrderDate?: Date;
  arriveOnSiteDate?: Date;
  startServiceDate?: Date;
  finishServiceDate?: Date;
  ticketDate?: Date;
  syncDate?: Date;
  id?: number;
}
