import { IDashboardDailyRoute, IWeightTicket } from '@root/types';

export interface IForm {
  scrollContainerHeight: number;
  dailyRoute: IDashboardDailyRoute;
  onAddRef(ref: HTMLElement | null): void;
  onClose(): void;
}

export interface IToggleWeightTicketModal {
  dailyRouteId: number;
  isEdit?: boolean;
  weightTicket?: IWeightTicket;
}
