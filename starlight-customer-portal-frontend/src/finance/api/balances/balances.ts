import { balancesQueries } from '@root/finance/graphql';

export class BalancesService {
  static async getCustomerBalance(customerId: number) {
    return await balancesQueries.customerBalance(customerId);
  }
}
