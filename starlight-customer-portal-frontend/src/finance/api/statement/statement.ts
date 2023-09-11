import { GraphqlVariables, haulingHttpClient } from '@root/core/api/base';
import { statementQueries } from '@root/finance/graphql';

export enum StatementSorting {
  CREATED_AT = 'CREATED_AT',
}

export class StatementService {
  getStatements(
    variables: GraphqlVariables & {
      customerId?: number;
      businessUnitId?: number;
    },
  ) {
    return statementQueries.getList(variables);
  }

  static async downloadStatements(query: string) {
    return haulingHttpClient.get(`statements/download?${query}`);
  }
}
