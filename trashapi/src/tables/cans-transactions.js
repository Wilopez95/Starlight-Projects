import constants from '../utils/constants.js';

import { fields } from './locations.js';
import locations1 from './locations1.js';
import locations2 from './locations2.js';

import cans from './cans.js';
import transactions from './transactions.js';
import { cansLocationJoin, cansLocationFields } from './cans-location.js';

export const cansTransactionsJoin = cansLocationJoin
  .leftJoin(transactions)
  .on(cans.id.equals(transactions.canId))
  .leftJoin(locations1)
  .on(transactions.locationId1.equals(locations1.id))
  .leftJoin(locations2)
  .on(transactions.locationId2.equals(locations2.id));

// transactions.id = (select id from transactions where transactions.canId = cans.id and transactions.action = "DROPOFF" order by transactions.timestamp desc limit 1)
const lastTransaction = transactions
  .select(transactions.id)
  .where(
    transactions.canId
      .equals(cans.id)
      .and(transactions.action.equals(constants.can.action.DROPOFF)),
  )
  .order(transactions.timestamp.desc)
  .limit(1);

export const cansLastTransactionJoin = cansLocationJoin
  .leftJoin(transactions)
  .on(transactions.id.equals(lastTransaction))
  .leftJoin(locations1)
  .on(transactions.locationId1.equals(locations1.id))
  .leftJoin(locations2)
  .on(transactions.locationId2.equals(locations2.id));

const cansTransactionsFields = [
  ...cansLocationFields,
  transactions.id.as('transactionId'),
  transactions.timestamp.as('transactionTimestamp'),
  transactions.action.as('transactionAction'),
  transactions.payload.as('transactionPayload'),
  transactions.locationId1,
  ...fields(locations1),
  transactions.locationId2,
  ...fields(locations2),
];

export default {
  select: (...additionalFields) =>
    cans.select(...cansTransactionsFields, ...additionalFields).from(cansTransactionsJoin),
  selectLast: (...additionalFields) =>
    cans.select(...cansTransactionsFields, ...additionalFields).from(cansLastTransactionJoin),
};
