import { RequestQueryParams } from '@root/core/api/base';
import { parseDate } from '@root/core/helpers';
import { ICreditCard, JsonConversions } from '@root/core/types';
import { creditCardQueries } from '@root/finance/graphql';

import { ICreditCardExtended, JobSiteItem } from './types';

const mapCreditCardResult = (cc: JsonConversions<ICreditCardExtended>): ICreditCard => ({
  ...cc,
  id: Number(cc.id),
  jobSites: cc.jobSites?.map(({ id }: JobSiteItem) => Number.parseInt(id)) || null,
  expDate: parseDate(cc.expDate),
  createdAt: parseDate(cc.createdAt),
  updatedAt: parseDate(cc.updatedAt),
});

export class CreditCardService {
  async get(customerId: number, options: RequestQueryParams = {}) {
    const result = await creditCardQueries.getOneByCustomerId(customerId, options);

    return result.creditCards.map(mapCreditCardResult);
  }

  async getById(id: string) {
    const result = await creditCardQueries.getById(id);

    return mapCreditCardResult(result.creditCard);
  }

  async create(customerId: number, data: Partial<ICreditCard>) {
    const result = await creditCardQueries.create(customerId, data);

    return result.addCreditCard;
  }

  async patch(id: number, data: Partial<ICreditCard>) {
    const result = await creditCardQueries.update(id, data);

    return result.updateCreditCard;
  }
}
