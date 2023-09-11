import { Maybe } from '../helpers';

import { IBillingCustomer } from './billingCustomer';

export interface ICustomerQuery {
  customer: Maybe<IBillingCustomer>;
}
