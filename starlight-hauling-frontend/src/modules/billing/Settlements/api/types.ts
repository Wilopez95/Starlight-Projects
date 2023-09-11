import { Maybe } from '../../../../types';
import { ISettlement, ISettlementTransaction } from '../types';

export type AllSettlementsResponse = {
  settlements: ISettlement[];
  settlementsCount: number;
};

export type SettlementByIdResponse = {
  settlement: Maybe<ISettlement>;
};

export type RequestSettlementResponse = {
  requestSettlement: string;
};

export type SettlementTransactionsResponse = {
  settlementTransactions: ISettlementTransaction[];
};
