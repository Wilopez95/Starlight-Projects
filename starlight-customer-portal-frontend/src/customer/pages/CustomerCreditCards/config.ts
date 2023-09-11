import { Paths } from '@root/core/consts';
import { IRoute } from '@root/core/types';

import CustomerCreditCards from './CustomerCreditCards';

export const CustomerCreditCardsConfig: IRoute = {
  name: 'Credit Cards',
  entity: 'credit-cards',
  Component: CustomerCreditCards,
  path: Paths.CustomerCreditCards,
};
