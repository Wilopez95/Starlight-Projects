import { pickQuick, columns } from '../utils/functions.js';
import workOrderNotes from '../tables/wo-notes.js';
import { locationExtractor } from './location.js';
import { canExtractor } from './can.js';

// :: Object -> Object
// workOrderNoteView({
//   id: 1,
//   type: "NOTE",
//   note: {
//     text: 'some text'
//   },
//   workOrderId: 1,
//   locationId: 2
// })
// > {
//   id: 1,
//   type: 'NOTE',
//   workOrderId: 1,
//   note: {
//     text: 'some text'
//   },
//   location: {
//     id: 2
//   }
// }

const workOrderNoteColumns = columns(
  // omit these columns
  ['locationId'],
  // pick these columns, which were extracted above
  ['location', 'can'],
  workOrderNotes,
);

/**
 * It takes a work order note object and returns a new object with only the columns we want to display
 * @returns An object with the following properties:
 *   id
 *   createdAt
 *   updatedAt
 *   type
 *   locationId
 *   workOrderId
 *   note {
 *     text
 *   },
 *   location {
 *     id
 *   }
 */
const workOrderNoteView = a => {
  const location = locationExtractor(a);
  const can = canExtractor(a);
  return pickQuick(workOrderNoteColumns, {
    ...a,
    ...location,
    ...can,
  });
};

export default workOrderNoteView;
