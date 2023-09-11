import Chance from 'chance';
import { point } from '../../src/models/locations';
import constants from '../../src/utils/constants';

const {
  location: {
    type: { TRUCK, LOCATION },
  },
} = constants;

const chance = new Chance();

export default (
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
    waypointName,
    deleted: 0,
  };
};
