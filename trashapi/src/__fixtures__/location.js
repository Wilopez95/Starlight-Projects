import faker from 'faker';
import Chance from 'chance';
import { point } from '../models/locations.js';
import constants from '../utils/constants.js';

const {
  location: {
    type: { TRUCK, LOCATION },
  },
} = constants;

const chance = new Chance();

export const BASE_LOCATION = {
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  location: { lon: -80.12066639999999, lat: 26.1384493 },
  type: 'LOCATION',
};

export const LOCATION_WP_NAME = {
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  location: { lon: -80.12066639999999, lat: 26.1384493 },
  type: 'LOCATION',
  waypointName: 'Some Location',
  waypointType: null,
};

export const LOCATION_WAYPOINT = {
  name: '1055 N Federal Hwy, Fort Lauderdale, FL 33304',
  description: faker.lorem.sentence(),
  location: { lon: -80.12066639999999, lat: 26.1384493 },
  type: 'WAYPOINT',
  waypointName: 'The Link',
  waypointType: 'HOME_YARD',
};

export const LOCATION_WAYPOINT_BAD = {
  name: '1055 N Federal Hwy, Fort Lauderdale, FL 33304',
  description: faker.lorem.sentence(),
  location: { lon: -80.12066639999999, lat: 26.1384493 },
  type: 'WAYPOINT',
  waypointType: 'HOME_YARD',
};

export const LOCATION_TRUCK = {
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  location: null,
  type: 'TRUCK',
  waypointName: null,
  waypointType: null,
};

export const LOCATION_TRUCK_LOCATION = {
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  location: { lon: -80.12066639999999, lat: 26.1384493 },
  type: 'TRUCK',
  waypointName: null,
  waypointType: null,
};

export const generateLocation = (
  type = chance.pickone([TRUCK, LOCATION]),
  isPoint = true,
  namePrefix = '',
  waypointType,
  waypointName,
) => {
  const name = namePrefix + chance.word();
  return {
    name,
    seedName: name,
    location: isPoint
      ? point(chance.longitude(), chance.latitude())
      : { lon: chance.longitude(), lat: chance.latitude() },
    type,
    waypointType,
    description: faker.lorem.sentence(),
    waypointName,
    deleted: 0,
  };
};
