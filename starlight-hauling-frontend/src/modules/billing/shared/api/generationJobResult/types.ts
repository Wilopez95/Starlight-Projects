import { Maybe } from '../../../../../types';
import {
  type IFinChargeGenerationJobResult,
  type IGenerationJobResult,
  type IInvoiceGenerationJobResult,
  type ISettlementGenerationJobResult,
  type IStatementGenerationJobResult,
} from '../../types';

export type InvoiceGenerationResultResponse = {
  invoiceGenerationJob: Maybe<IInvoiceGenerationJobResult>;
};

export type FinChargeGenerationResultResponse = {
  finChargeGenerationJob: Maybe<IFinChargeGenerationJobResult>;
};

export type GenerationJobStatusResponse = {
  generationJobStatus: Maybe<IGenerationJobResult>;
};

export type StatementGenerationResultResponse = {
  statementGenerationJob: Maybe<IStatementGenerationJobResult>;
};

export type SettlementGenerationResultResponse = {
  settlementGenerationJob: Maybe<ISettlementGenerationJobResult>;
};
