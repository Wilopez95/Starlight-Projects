import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

const objectFields = [
  'name',
  'description',
  'companyName',
  'logo',
  'address',
  'address2',
  'city',
  'state',
  'zipcode',
  'phoneNumber',
  'content',
  'contentRaw',
  'header',
  'headerRaw',
  'footer',
  'footerRaw',
  'acknowledgement',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
];

const columns = ['id', 'deleted', ...objectFields];

export default defineTable('templates', columns);

export const fields = functions.fields(objectFields);
