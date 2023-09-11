import { columns, pickQuick } from '../utils/functions.js';
import trips from '../tables/trips.js';

// :: Object -> Object
// tripView({
//   tripType: 'PRE_TRIP',
//   driverId: 1
//   driverName: 'Sam',
//   truckId: 2,
//   truckName: 'Bumblebee'
// })
// > {
//   tripType: 'PRE_TRIP',
//   driver: {
//     id: 1,
//     name: 'Sam'
//   },
//   truck: {
//   	id: 2,
//   	name: 'Bumblebee'
//   }
// }
const tripColumns = columns(['driverId', 'truckId'], ['driver', 'truck'], trips);
const tripView = a => pickQuick(tripColumns, { ...a });

export default tripView;
