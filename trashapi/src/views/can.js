import cans from '../tables/cans.js';
import { columns, pickQuick } from '../utils/functions.js';

// :: Object -> Object
// canView({
//   id: 1,
//   locationId: 2,
//   name: 'Can #1'
// })
// > {
//   id: 1,
//   name: 'Can #1'
// }
const canColumns = columns(['locationId', 'prevLocationId'], ['truck', 'businessUnitId'], cans);

const canView = a => {
  const buId = a.businessUnitId ?? a.haulingBusinessUnitId;
  a.businessUnitId = buId;
  a.haulingBusinessUnitId = buId;
  return pickQuick(canColumns, a);
};

export const canExtractor = a => {
  const canOrig = {
    id: a.canId,
    truckId: a.canTruckId,
    name: a.canName,
    serial: a.canSerial,
    size: a.canSize,
    requiresMaintenance: a.canRequiresMaintenance,
    outOfService: a.canOutOfService,
    locationId: a.canLocationId,
    prevLocationId: a.canPrevLocationId,
    source: a.canSource,
    startDate: a.canStartDate,
    hazardous: a.canHazardous,
    action: a.canAction,
    timestamp: a.canTimestamp,
    createdBy: a.canCreatedBy,
    createdDate: a.canCreatedDate,
    modifiedBy: a.canModifiedBy,
    modifiedDate: a.canModifiedDate,
    inUse: a.canInUse,
  };

  return { can: canView(canOrig) };
};

export default canView;
