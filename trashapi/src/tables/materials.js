import defineTable from '../utils/defineTable.js';

const columns = ['id', 'name', 'createdBy', 'createdDate', 'modifiedBy', 'modifiedDate', 'deleted'];

export default defineTable('materials', columns);
