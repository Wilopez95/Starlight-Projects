import { Maybe } from '../../../../types';
import { IFinanceCharge } from '../types';

export type FinanceChargeResponse = {
  financeCharges: IFinanceCharge[];
  invoicesCount: number;
};

export type FinanceChargeByIdResponse = {
  financeCharge: Maybe<IFinanceCharge>;
};

export type FinancialChargeCreatedDataResponse = {
  createFinanceCharge: string;
};

export interface ISendFinanceChargeData {
  ids: number[];
  emails?: string[];
}
