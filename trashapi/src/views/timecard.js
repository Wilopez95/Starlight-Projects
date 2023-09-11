import { pickQuick, columns } from '../utils/functions.js';
import timecards from '../tables/timecards.js';

// :: Object -> Object
// timecardView({
//   startTime: '...',
//   driverId: 1
//   driverName: 'Bumblebee'
// })
// > {
//   startTime: '...',
//   driver: {
//     id: 1,
//     name: 'Bumblebee'
//   }
// }

const timecardColumns = columns(['driverId'], ['driver'], timecards);

const timecardView = a => pickQuick(timecardColumns, { ...a });

export default timecardView;
