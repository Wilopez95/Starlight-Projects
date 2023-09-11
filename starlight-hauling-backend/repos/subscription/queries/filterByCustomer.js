import CustomerRepo from '../../customer.js';

import { TABLE_NAME } from '../../../consts/subscriptions.js';

export const filterByCustomer = ({ trx, query, customersIds, customerName, join = true }) => {
  let filteredQuery = query;
  const customersHT = CustomerRepo.getHistoricalTableName();

  if (join && (customersIds?.length || customerName)) {
    filteredQuery = filteredQuery.innerJoin(
      customersHT,
      `${customersHT}.id`,
      `${TABLE_NAME}.customerId`,
    );
  }
  if (customersIds?.length) {
    filteredQuery = filteredQuery.whereIn(`${customersHT}.originalId`, customersIds);
  }
  if (customerName) {
    const concat = trx.raw(
      `CONCAT(${customersHT}.business_name,${customersHT}.first_name,${customersHT}.last_name)`,
    );
    filteredQuery = filteredQuery.andWhere(concat, 'ilike', `%${customerName}%`);
  }

  return filteredQuery;
};
