import { json } from '../utils/query.js';
import defineTable from '../utils/defineTable.js';
import workOrders from './workorders.js';
import cans, { fields as canFields } from './cans.js';
import locations, { fields as locationFields } from './locations.js';

const columns = [
  'id',
  'workOrderId',
  'locationId',
  'type',
  'note',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
  'deleted',
];

const notes = defineTable('wo_notes', columns);

export const notesWorkOrderJoin = notes
  .leftJoin(workOrders)
  .on(notes.workOrderId.equals(workOrders.id))
  .leftJoin(locations)
  .on(notes.locationId.equals(locations.id))
  .leftJoin(cans)
  .on(cans.id.equals(json(notes.note, 'canId').cast('bigint')));

const notesWorkOrderFields = [notes.star(), ...locationFields(locations), ...canFields(cans)];

const select = notes.select.bind(notes);
notes.select = (...additionalFields) =>
  select(...notesWorkOrderFields, ...additionalFields).from(notesWorkOrderJoin);

export default notes;
