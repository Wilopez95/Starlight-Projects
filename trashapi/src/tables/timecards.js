import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

const objectFields = [
  'startTime',
  'stopTime',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
];

const columns = ['id', 'driverId', 'deleted', ...objectFields];

export default defineTable('timecards', columns);

export const fields = functions.fields(objectFields);
