import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

const objectFields = [
  'id',
  'name',
  'serial',
  'size',
  'requiresMaintenance',
  'outOfService',
  'locationId',
  'prevLocationId',
  'source',
  'startDate',
  'hazardous',
  'action',
  'timestamp',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
  'inUse',
  'haulingBusinessUnitId',
  'truckId',
];

const columns = [...objectFields, 'deleted'];

export default defineTable('cans', columns);

export const fields = functions.fields(objectFields);
