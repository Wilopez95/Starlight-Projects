import type { WorkOrderStatus } from '@root/core/consts';

import type { FileWithPreview } from '../base/file';

import type { IEntity } from './entity';

export interface IWorkOrderMediaFile {
  id: number;
  url: string;
  author: string | null;
  timestamp: Date | null;
  fileName: string | null;
  fromDispatch: boolean;
}

export type WorkOrderWeightUnit = 'tons' | 'yards' | 'none';

export interface IWorkOrder extends IEntity {
  woNumber: number;
  route: string | null;
  completionDate: Date | null;
  truck: number | null;
  droppedEquipmentItem: number | null;
  pickedUpEquipmentItem: number | null;
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
  driverNotes: null | string;
  syncDate: Date | null;
  status: WorkOrderStatus;
}

export interface IEditableWorkOrder {
  woNumber: string;
  route: string;
  truck: string;
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

  completionDate?: Date;
  startWorkOrderDate?: Date;
  arriveOnSiteDate?: Date;
  startServiceDate?: Date;
  finishServiceDate?: Date;
  ticketDate?: Date;
  syncDate?: Date;
  id?: number;
}
