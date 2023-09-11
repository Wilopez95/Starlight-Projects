import R from 'ramda';
import _debug from 'debug';
import transactionView from './transaction.js';
import canLocationView from './can-location.js';

const debug = _debug('api:views:can-trans');
// :: [Object] -> [Object]
// cansTransactionsView([
//   {
//     id: 1,
//     name: 'Can #1',
//     transactionId: 1,
//     transactionAction: 'MOVE',
//     locationId1: 1,
//     locationLocation1: {x: 0, y: 0},
//     locationType1: 'LOCATION',
//     locationId2: 2,
//     locationLocation2: {x: 0, y: 0},
//     locationType2: 'LOCATION'
//   },
//   {
//     id: 1,
//     name: 'Can #1',
//     transactionId: 2,
//     transactionAction: 'PICKUP',
//     locationId1: 2,
//     locationLocation1: {x: 0, y: 0},
//     locationType1: 'LOCATION',
//     locationId2: 3,
//     locationType2: 'TRUCK'
//   }
// ])
// > [
//   {
//     id: 1,
//     name: 'Can #1',
//     transactions: [
//       {
//         id: 1,
//         action: 'MOVE',
//         location1: {
//           id: 1,
//           location: {lat: 0, lon: 0},
//           type: 'LOCATION'
//         },
//         location2: {
//           id: 2,
//           location: {lat: 0, lon: 0},
//           type: 'LOCATION'
//         }
//       },
//       {
//         id: 2,
//         action: 'PICKUP',
//         location1: {
//           id: 2,
//           location: {lat: 0, lon: 0},
//           type: 'LOCATION'
//         },
//         location2: {
//           id: 3,
//           type: 'TRUCK'
//         }
//       }
//     ]
//   }
// ]

/* Sorting the rows by can id and transaction id. */
const canTransactionsComparator = R.comparator(
  (a, b) => a.id < b.id || (a.id === b.id && a.transactionId > b.transactionId),
);

/**
 * > It takes an array of rows from the database and returns an array of objects that represent the
 * cans and their transactions
 * @returns An array of objects.
 */
const cansTransactionsView = rowsParam => {
  let rows = rowsParam;
  rows = R.is(Array, rows) ? rows : [rows];
  const result = [];
  let current = null;
  debug(current);
  rows.sort(canTransactionsComparator);
  rows.forEach(val => {
    if (current === null || current.id !== val.id) {
      current = canLocationView(val);
      current.transactions = [];
      result.push(current);
    }
    current.transactions.push(transactionView(val));
  });
  return result;
};

export default cansTransactionsView;
