export type GenerationJobStatus = 'PENDING' | 'FINISHED';

export interface IGenerationJobResult {
  id: string;
  count: number;
  failedCount: number;
  expectedCount: number;
  status: GenerationJobStatus;
  batchStatementId: number;
  invoicesTotal: number;
}

export interface IInvoiceGenerationJobResult extends IGenerationJobResult {
  customersIncluded: number;
  processedOrders: number;
  generatedInvoices: number;
  invoicesTotal: number;
  processedSubscriptions?: number;
  startTime?: string;
  endTime?: string;
  durationInSec?: number;
}

export interface IFinChargeGenerationJobResult extends IGenerationJobResult {
  invoicesTotal: number;
  invoicesCount: number;
  customersCount: number;
  financeChargeIds: number[];
}

export interface IStatementGenerationJobResult extends IGenerationJobResult {
  invoicesTotal: number;
  paymentsTotal: number;
  invoicesCount: number;
  total: number;
  statementIds: number[];
}

export interface ISettlementGenerationJobResult extends IGenerationJobResult {
  settlementId: number;
}
