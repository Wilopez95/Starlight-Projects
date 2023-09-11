import workOrders from './workorders.js';
import workOrderNotes from './wo-notes.js';
import { workOrdersLocationsFields, workOrdersLocationsJoin } from './workorders-locations.js';

export const workOrdersLocationsNotesJoin = workOrdersLocationsJoin
  .leftJoin(workOrderNotes)
  .on(workOrders.id.equals(workOrderNotes.workOrderId));

const workOrdersLocationsNotesFields = [...workOrdersLocationsFields];

export default {
  select: (...additionalFields) =>
    workOrders
      .select(...workOrdersLocationsNotesFields, ...additionalFields)
      .from(workOrdersLocationsNotesJoin),
};
