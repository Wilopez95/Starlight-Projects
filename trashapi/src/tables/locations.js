import * as functions from '../utils/functions.js';
import defineTable from '../utils/defineTable.js';

export const editableFields = [
  'name',
  'longitude',
  'latitude',
  'type',
  'waypointType',
  'seedName',
  'waypointName',
  'description',
  'licensePlate',
];

export const objectFields = [
  'name',
  'type',
  'description',
  'waypointType',
  'waypointName',
  'latitude',
  'longitude',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
  'licensePlate',
];

const columns = ['id', 'seedName', 'deleted', ...objectFields];

export default defineTable('locations', columns);

export const fields = functions.fields(objectFields);
