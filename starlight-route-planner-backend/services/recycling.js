import { makeRecyclingRequest } from '../utils/makeRequest.js';

const GET_RECYCLING_ORDER = `
    query getRecyclingOrder($id: Int!) {
        order(id: $id) {
            id
            weightTicketUrl
        }
    }
`;

export class RecyclingService {
  static async getOrder(id, { user, schemaName, recyclingBusinessUnitId }) {
    const ctx = {
      state: { user, schemaName, businessUnitId: recyclingBusinessUnitId },
    };

    return makeRecyclingRequest(ctx, {
      method: 'post',
      url: '/graphql',
      data: {
        query: GET_RECYCLING_ORDER,
        variables: {
          id,
        },
      },
    });
  }
}
