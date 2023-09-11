import { IWeightTicketRequestParams } from '@root/stores/WeightTicketStore/types';

export type IUpdateWeightTicketParams = Omit<IWeightTicketRequestParams, 'timeOnLandfill'>;

export interface ICreateWeightTicketParams
  extends Omit<IWeightTicketRequestParams, 'timeOnLandfill'> {
  dailyRouteId: number;
}
