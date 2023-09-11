import { ICustomer, IEntity } from '../../../types';

export const enum StatementEmailStatus {
  Pending = 'PENDING',
  Sent = 'SENT',
  Delivered = 'DELIVERED',
  FailedToSend = 'FAILED_TO_SEND',
  FailedToDeliver = 'FAILED_TO_DELIVER',
}

export type StatementSortType =
  | 'ID'
  | 'BALANCE'
  | 'CREATED_AT'
  | 'INVOICES_COUNT'
  | 'STATEMENT_DATE'
  | 'END_DATE';

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
  pdfUrl: string;
  prevPdfUrl?: string;
  emails?: IStatementEmail[];
  prevBalance?: number;
  customer?: ICustomer;
  financeChargeExists?: boolean;
}

export interface INewStatement {
  statementDate?: Date;
  endDate: Date;
}
