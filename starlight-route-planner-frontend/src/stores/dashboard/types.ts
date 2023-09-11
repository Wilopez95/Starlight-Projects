import { IUpdateDashboardDailyRouteRequestParams } from '@root/api';
import { IWeightTicket } from '@root/types';

import { IWeightTicketRequestParams } from '../WeightTicketStore/types';

export interface IWeightTicketModalSettings {
  visible: boolean;
  isEdit: boolean;
  materialIds?: number[];
  weightTicket?: IWeightTicket;
  dailyRouteId?: number;
}

export interface IWeightTicketDetailsSettings {
  materialIds?: number[];
  weightTickets?: IWeightTicket[];
  initialIndex?: number;
}

export interface IUpdateDashboardDailyRouteParams extends IUpdateDashboardDailyRouteRequestParams {
  weightTicketsToCreate: IWeightTicketRequestParams[];
  weightTicketsToEdit: IWeightTicketRequestParams[];
  weightTicketIdsToDelete: number[];
}
