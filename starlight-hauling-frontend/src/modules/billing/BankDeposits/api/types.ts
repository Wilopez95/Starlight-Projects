import { Maybe } from '../../../../types';
import { IBankDeposit } from '../types';

export type AllBankDepositsResponse = {
  bankDeposits: IBankDeposit[];
};

export type BankDepositByIdResponse = {
  bankDeposit: Maybe<IBankDeposit>;
};
