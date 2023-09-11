import { ICustomer } from '../../../customer/types/entities/customer';

import type { IEntity } from './entity';

export const enum StatementEmailStatus {
  Pending = 'PENDING',
  Sent = 'SENT',
  Delivered = 'DELIVERED',
  FailedToSend = 'FAILED_TO_SEND',
  FailedToDeliver = 'FAILED_TO_DELIVER',
}

export interface IStatementEmail extends IEntity {
  receiver: string;
  status: StatementEmailStatus;
}

export interface IStatement extends IEntity {
  statementDate: Date;
  endDate: Date;
  invoicesCount: number;
  invoicesTotal: number;
  balance: number;
  exagoPath: string;
  emails?: IStatementEmail[];
  prevBalance?: number;
  customer?: ICustomer;
}

export interface INewStatement {
  statementDate?: Date;
  endDate: Date;
}
