import canView from './can.js';
import { locationPrevLocationExtractor } from './location.js';

// :: Object -> Object
// canLocationView({
//   name: 'Can #1'
//   size: '20',
//   locationId: 10,
//   locationName: '1768 Grant St'
// })
// > {
//   name: 'Can #1',
//   size: '20',
//   location: {
//     id: 10,
//     name: '1768 Grant St'
//   }
// }

export default can => ({
  ...canView(can),
  ...locationPrevLocationExtractor(can),
});
