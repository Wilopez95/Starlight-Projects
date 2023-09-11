export const GenerationJobFragment = `
  id
  count
  expectedCount
  failedCount
  status
`;

export const InvoiceGenerationJobFragment = `
  ${GenerationJobFragment}
  processedOrders
  processedSubscriptions
  customersIncluded
  generatedInvoices
  invoicesTotal
  startTime
  endTime
  durationInSec
`;

export const FinChargeGenerationJobFragment = `
  ${GenerationJobFragment}
  invoicesTotal
  invoicesCount
  customersCount
  financeChargeIds
`;

export const StatementGenerationJobFragment = `
  ${GenerationJobFragment}
  invoicesTotal
  paymentsTotal
  invoicesCount
  total
  statementIds
  batchStatementId
`;

export const SettlementGenerationJobFragment = `
  ${GenerationJobFragment}
  settlementId
`;
