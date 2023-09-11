import { Maybe } from '../../../../types';
import { IPayout } from '../types';

export type CustomerPayoutsResponse = {
  payouts: IPayout[];
};

export type CustomerPayoutResponse = {
  payout: Maybe<IPayout>;
};

export type PayoutResponse = {
  createPayout: IPayout;
};
