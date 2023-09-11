import defineTable from '../utils/defineTable.js';

const columns = [
  'id',
  'key',
  'value',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
  'haulingBusinessUnitId',
];

export default defineTable('settings', columns);
