import faker from 'faker';
import R from 'ramda';
import csv from 'csv';
import Chance from 'chance';
import { format } from 'date-fns';
import { promisify } from '../utils/functions.js';
import { csvDateFrmt } from '../utils/format.js';

export const BASIC_CAN = {
  name: faker.lorem.word(),
  size: '10',
  serial: '0211',
  requiresMaintenance: false,
  outOfService: false,
  hazardous: false,
};

export const MAINT_CAN = {
  name: faker.lorem.word(),
  size: '10',
  serial: '0212',
  requiresMaintenance: true,
  outOfService: false,
  hazardous: false,
};

export const OOS_CAN = {
  name: faker.lorem.word(),
  size: '10',
  serial: '0213',
  requiresMaintenance: false,
  outOfService: true,
  hazardous: false,
};

export const HAZMAT_CAN = {
  name: faker.lorem.word(),
  size: '10',
  serial: '0214',
  requiresMaintenance: false,
  outOfService: false,
  hazardous: true,
};

export const LOCATION_CAN = {
  name: faker.lorem.word(),
  size: '10',
  serial: '0215',
  requiresMaintenance: false,
  outOfService: false,
  hazardous: false,
  location: {
    id: 2,
    name: '605 W 62nd Ave, Denver, CO 80216',
    location: { lon: -104.99, lat: 39.810991 },
    type: 'WAYPOINT',
    waypointType: 'HOME_YARD',
    seedName: '605 W 62nd Ave, Denver, CO 80216',
    waypointName: '5280 Home Yard',
    createdBy: 'dispatch3',
    createdDate: '2016-10-12T14:16:50.410Z',
    modifiedBy: 'terry.adams@starlightpro.com',
    modifiedDate: '2017-11-19T23:46:12.233Z',
    deleted: 0,
    description: null,
  },
};

const chance = new Chance();

const bool = () => chance.integer({ min: 0, max: 1 });

export const toCSV = (cans, adr) =>
  promisify(cb =>
    csv.stringify(
      R.map(
        can => [
          can.id,
          can.serial,
          can.size,
          can.name,
          can.startDate ? format(can.startDate, csvDateFrmt) : null,
          can.source,
          adr ? chance.pickone(adr) : chance.address(),
        ],
        cans,
      ),
      cb,
    ),
  );

export const generateCan = ({
  name = chance.word(),
  serial = chance.word(),
  size = String(chance.pickone([12, 20, 30, 40])),
  requiresMaintenance = bool(),
  outOfService = bool(),
  deleted = 0,
  source = chance.word(),
  startDate = chance.date({ year: 2018, millisecond: 0 }),
  hazardous = bool(),
} = {}) => ({
  name,
  serial,
  size,
  requiresMaintenance,
  outOfService,
  deleted,
  source,
  startDate,
  hazardous,
});
