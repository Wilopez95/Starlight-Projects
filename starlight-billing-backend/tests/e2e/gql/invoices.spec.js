import { graphqlClient } from '../../client.js';
import { getAllQuery } from '../../gql/queries/invoices.js';
import { getAllInput } from '../../gql/variables/invoices.js';

describe('GQL Invoices GraphQL Flow', () => {
  it('should list invoices', async () => {
    const res = await graphqlClient.request(getAllQuery, getAllInput);
    expect(res).toHaveProperty('invoices');
    expect(res).toHaveProperty('invoicesCount');
  });
});
