import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

export const objectFields = [
  'tripType',
  'odometer',
  'truckId',
  'driverId',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
];

const columns = ['id', 'deleted', ...objectFields];

export default defineTable('trips', columns);

export const fields = functions.fields(objectFields);
