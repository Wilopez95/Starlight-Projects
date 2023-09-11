import { location1Location2Extractor } from './location.js';

// :: Object -> Object
export default can => ({
  id: can.transactionId,
  action: can.transactionAction,
  payload: can.transactionPayload,
  timestamp: can.transactionTimestamp,
  ...location1Location2Extractor(can),
});
