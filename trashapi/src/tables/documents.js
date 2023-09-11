import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

const objectFields = [
  'url',
  'printedName',
  'driver',
  'lat',
  'lon',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
];

const columns = ['id', 'workOrderId', 'templateId', ...objectFields];

export default defineTable('documents', columns);

export const fields = functions.fields(objectFields);
