import { BestTimeToCome } from '@root/components/OrderTimePicker/types';

export interface IRescheduleOrderData {
  oldServiceDate: Date;
  serviceDate: Date;
  bestTimeToCome: BestTimeToCome;
  bestTimeToComeFrom: string | null;
  bestTimeToComeTo: string | null;
  addTripCharge: boolean;
  comment?: string | null;
}
