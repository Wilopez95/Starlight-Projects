import { BaseGraphqlService } from '../../../../../api/base';

import {
  FinChargeGenerationJobFragment,
  GenerationJobFragment,
  InvoiceGenerationJobFragment,
  SettlementGenerationJobFragment,
  StatementGenerationJobFragment,
} from './fragments';
import {
  type FinChargeGenerationResultResponse,
  type GenerationJobStatusResponse,
  type InvoiceGenerationResultResponse,
  type SettlementGenerationResultResponse,
  type StatementGenerationResultResponse,
} from './types';

export class GenerationJobService extends BaseGraphqlService {
  getJobStatus(variables: { id: string }) {
    return this.graphql<GenerationJobStatusResponse>(
      `
    query GenerationJobStatus($id: ID!) {
      generationJobStatus(id: $id)
      {
        ${GenerationJobFragment}
      }
    }`,
      variables,
    );
  }

  getInvoicingResult(variables: { id: string }) {
    return this.graphql<InvoiceGenerationResultResponse>(
      `
    query InvoiceGenerationJob($id: ID!) {
      invoiceGenerationJob(id: $id)
      {
        ${InvoiceGenerationJobFragment}

      }
    }`,
      variables,
    );
  }

  getFinChargesResult(variables: { id: string }) {
    return this.graphql<FinChargeGenerationResultResponse>(
      `
    query FinChargeGenerationJob($id: ID!) {
      finChargeGenerationJob(id: $id)
      {
        ${FinChargeGenerationJobFragment}

      }
    }`,
      variables,
    );
  }

  getStatementsResult(variables: { id: string }) {
    return this.graphql<StatementGenerationResultResponse>(
      `
    query StatementGenerationJob($id: ID!) {
      statementGenerationJob(id: $id)
      {
        ${StatementGenerationJobFragment}

      }
    }`,
      variables,
    );
  }

  getSettlementsResult(variables: { id: string }) {
    return this.graphql<SettlementGenerationResultResponse>(
      `
    query SettlementGenerationJob($id: ID!) {
      settlementGenerationJob(id: $id)
      {
        ${SettlementGenerationJobFragment}

      }
    }`,
      variables,
    );
  }
}
