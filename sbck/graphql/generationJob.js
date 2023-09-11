import gql from 'graphql-tag';

export const typeDefs = gql`
  type GenerationJob {
    id: ID!
    status: GenerationJobStatus
    count: Int!
    expectedCount: Int!
    failedCount: Int!
    startTime: String
    endTime: String
    durationInSec: Int
  }

  type InvoiceGenerationJobResult {
    id: ID!
    count: Int!
    expectedCount: Int!
    failedCount: Int!
    status: GenerationJobStatus!
    startTime: String
    endTime: String
    durationInSec: Int

    processedOrders: Int!
    processedSubscriptions: Int!
    customersIncluded: Int!
    generatedInvoices: Int!
    invoicesTotal: Float!
  }

  type StatementGenerationJobResult {
    id: ID!
    count: Int!
    expectedCount: Int!
    failedCount: Int!
    status: GenerationJobStatus!

    invoicesTotal: Float!
    paymentsTotal: Float!
    invoicesCount: Int!
    total: Float!
    statementIds: [ID!]!
    batchStatementId: ID!
  }

  type FinChargeGenerationJobResult {
    id: ID!
    count: Int!
    expectedCount: Int!
    failedCount: Int!
    status: GenerationJobStatus!

    invoicesTotal: Float!
    invoicesCount: Int!
    customersCount: Int!
    financeChargeIds: [ID!]!
  }

  type SettlementGenerationJobResult {
    id: ID!
    count: Int!
    expectedCount: Int!
    failedCount: Int!
    status: GenerationJobStatus!

    settlementId: ID!
  }
`;

export const resolvers = {
  InvoiceGenerationJobResult: {},
};
