import SubscriptionServiceItemRepo from '../../subscriptionServiceItem/subscriptionServiceItem.js';
import SubscriptionRepo from '../../subscription/subscription.js';
import CustomerRepo from '../../customer.js';

import { TABLE_NAME } from '../../../consts/subscriptionOrders.js';

export const filterByCustomer = ({ trx, query, customersIds, customerName, join = true }) => {
  let filteredQuery = query;
  const customersHT = CustomerRepo.getHistoricalTableName();

  if (join && (customersIds?.length || customerName)) {
    const subscriptionsServiceItemsTable = SubscriptionServiceItemRepo.TABLE_NAME;
    const subscriptionsTable = SubscriptionRepo.TABLE_NAME;
    filteredQuery = filteredQuery
      .innerJoin(
        subscriptionsServiceItemsTable,
        `${subscriptionsServiceItemsTable}.id`,
        `${TABLE_NAME}.subscriptionServiceItemId`,
      )
      .innerJoin(
        subscriptionsTable,
        `${subscriptionsTable}.id`,
        `${subscriptionsServiceItemsTable}.subscriptionId`,
      )
      .innerJoin(customersHT, `${customersHT}.id`, `${subscriptionsTable}.customerId`);
  }
  if (customersIds?.length) {
    filteredQuery = filteredQuery.andWhere(`${customersHT}.originalId`, customersIds);
  }
  if (customerName) {
    const concat = trx.raw(
      `CONCAT(${customersHT}.business_name,${customersHT}.first_name,${customersHT}.last_name)`,
    );
    filteredQuery = filteredQuery.andWhere(concat, 'ilike', `%${customerName}%`);
  }

  return filteredQuery;
};
