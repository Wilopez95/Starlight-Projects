import R from 'ramda';
import Chance from 'chance';
import csv from 'csv';
import { format } from 'date-fns';

import { promisify } from '../../src/utils/functions';
import { csvDateFrmt } from '../../src/utils/format';
import constants from '../../src/utils/constants';

const chance = new Chance();

const string = () => chance.word();
const bool = () => chance.integer({ min: 0, max: 1 });
const date = () => chance.date({ year: 2015 });

export const statuses = constants.workOrder.status;

export const actions = constants.workOrder.action;
export const materials = constants.workOrder.material;

const csvDate = d => (d ? format(d, csvDateFrmt) : null);

export const toCSV = (workOrders, adr) =>
  promisify(cb =>
    csv.stringify(
      R.map(
        workOrder => [
          workOrder.id,
          workOrder.action,
          workOrder.status,
          workOrder.size,
          workOrder.material,
          csvDate(workOrder.scheduledDate),
          csvDate(workOrder.scheduledStart),
          csvDate(workOrder.scheduledEnd),
          workOrder.contactName,
          workOrder.contactNumber,
          // location 1
          adr ? chance.pickone(adr) : chance.address(),
          // location 2
          adr ? chance.pickone(adr) : chance.address(),
          workOrder.priority,
          workOrder.step,
          workOrder.permitNumber,
        ],
        workOrders,
      ),
      cb,
    ),
  );

export default ({
  id,
  status = String(chance.pickone(R.values(statuses))),
  action = String(chance.pickone(R.values(actions))),
  size = String(chance.pickone([12, 20, 30, 40])),
  material = chance.pickone(R.values(materials)),
  scheduledDate = date(),
  scheduledStart = date(),
  scheduledEnd = date(),
  poNumber = string(),
  contactName = string(),
  contactNumber = string(),
  customerName = string(),
  instructions = string(),
  alleyPlacement = bool(),
  earlyPickUp = bool(),
  okToRoll = bool(),
  negotiatedFill = bool(),
  cow = bool(),
  sos = bool(),
  cabOver = bool(),
  permittedCan = bool(),
  permitNumber = string(),
  profileNumber = string(),
  textOnWay = string(),
  customerProvidedProfile = bool(),
  priority = bool(),
  step = string(),
  createdBy,
  createdDate,
  modifiedBy,
  modifiedDate,
  location1,
  location2,
  driverId,
  deleted,
  index = 0,
} = {}) => ({
  ...(id ? { id } : {}),
  status,
  action,
  size,
  material,
  scheduledDate,
  scheduledStart,
  scheduledEnd,
  poNumber,
  contactName,
  contactNumber,
  customerName,
  instructions,
  alleyPlacement,
  earlyPickUp,
  okToRoll,
  negotiatedFill,
  cow,
  sos,
  cabOver,
  ...(permitNumber ? { permittedCan: 1 } : permittedCan),
  permitNumber,
  textOnWay,
  profileNumber,
  customerProvidedProfile,
  priority,
  step,
  ...(location1 ? { location1 } : {}),
  ...(location2 ? { location2 } : {}),
  ...(createdBy ? { createdBy } : {}),
  ...(createdDate ? { createdDate } : {}),
  ...(modifiedBy ? { modifiedBy } : {}),
  ...(modifiedDate ? { modifiedDate } : {}),
  ...(driverId ? { driverId } : {}),
  ...(deleted ? { deleted } : {}),
  index,
});
