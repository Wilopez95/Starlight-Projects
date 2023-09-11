import { columns, pickQuick } from '../utils/functions.js';
import workOrders from '../tables/workorders.js';
import { location1Location2Extractor } from './location.js';

const actualFields = ['locationId1', 'locationId2', 'suspensionLocationId'];
const aggregatedFields = ['location1', 'location2', 'suspensionLocation'];

// cleanup :: Object -> Object
// cleanup({
//   locationId1: 1,
//   locationId2: 2,
//   driverId: 1,
//   driver: {},
//   location1: {},
//   location2: {}
// })
// > {
//   driver: {},
//   location1: {},
//   location2: {}
// }
const workOrderFields = columns(
  [...actualFields, 'driverId'],
  [...aggregatedFields, 'driver'],
  workOrders,
);

// workorderView :: Object -> Object
// workorderView({
//   id: 1,
//   locationId1: 1,
//   locationId2: 2,
//   driverId: 1
// })
// > {
//   id: 1,
//   location1: {id: 1},
//   location2: {id: 2},
//   driver: {id: 1}
// }
// driverTruck*

const workorderView = a =>
  pickQuick(workOrderFields, {
    ...a,
    ...location1Location2Extractor(a),
  });
export default workorderView;
