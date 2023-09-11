import { GraphqlVariables, haulingHttpClient } from '@root/core/api/base';
import { AppliedFilterState } from '@root/core/common/TableTools/TableFilter';
import { invoiceQueries } from '@root/finance/graphql';

export class InvoiceService {
  getByCustomer(
    variables: GraphqlVariables & {
      customerId: number;
      jobSiteId?: number;
      filters?: AppliedFilterState;
      query?: string;
    },
  ) {
    return invoiceQueries.getByCustomer(variables);
  }

  getById(variables: GraphqlVariables & { id: number }) {
    return invoiceQueries.getById(variables);
  }

  getDetailedById(variables: GraphqlVariables & { id: number }) {
    return invoiceQueries.getDetailedById(variables);
  }

  static async downloadInvoices(query: string) {
    return haulingHttpClient.get(`invoices/combined?${query}`);
  }
}
