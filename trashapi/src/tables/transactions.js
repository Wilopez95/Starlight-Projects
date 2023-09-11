import defineTable from '../utils/defineTable.js';

const columns = [
  'id',
  'timestamp',
  'action',
  'payload',
  'locationId1',
  'locationId2',
  'canId',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
];

export default defineTable('transactions', columns);
