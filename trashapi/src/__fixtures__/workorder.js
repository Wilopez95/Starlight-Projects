/* eslint-disable complexity */
import R from 'ramda';
import faker from 'faker';
import Chance from 'chance';
import csv from 'csv';
import { format } from 'date-fns';
import { promisify } from '../utils/functions.js';
import { csvDateFrmt } from '../utils/format.js';
import constants from '../utils/constants.js';

const chance = new Chance();

const string = () => chance.word();
const bool = () => chance.integer({ min: 0, max: 1 });
const date = () => chance.date({ year: 2018 });

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

export const generateWorkOrder = ({
  id,
  status = String(chance.pickone(R.values(statuses))),
  action = String(chance.pickone(R.values(actions))),
  size = String(chance.pickone([10, 12, 20, 40])),
  material = chance.pickone(R.values(materials)),
  scheduledDate = '2018-02-03',
  scheduledStart = '08:00:00',
  scheduledEnd = '12:00:00',
  poNumber = string(),
  contactName = faker.name.findName(),
  contactNumber = string(),
  customerName = faker.name.findName(),
  instructions = faker.lorem.sentences(),
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
  signatureRequired = 0,
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
  signatureRequired,
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
