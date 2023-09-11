import workOrders from './workorders.js';
import { fields as locationFields } from './locations.js';
import locations1 from './locations1.js';
import locations2 from './locations2.js';
import suspensionLocations from './suspensionLocations.js';

export const workOrdersLocationsJoin = workOrders
  .leftJoin(locations1)
  .on(workOrders.locationId1.equals(locations1.id))
  .leftJoin(locations2)
  .on(workOrders.locationId2.equals(locations2.id))
  .leftJoin(suspensionLocations)
  .on(workOrders.suspensionLocationId.equals(suspensionLocations.id));

export const workOrdersLocationsFields = [
  workOrders.star(),
  ...locationFields(locations1),
  ...locationFields(locations2),
  ...locationFields(suspensionLocations),
];
