import faker from 'faker';

export const DRIVER = {
  name: faker.name.firstName(),
  username: faker.internet.email(),
  truck: {
    id: 11,
    name: 'El Coche',
    type: 'TRUCK',
  },
};

export const DRIVER_NO_TRUCK = {
  name: faker.name.firstName(),
  username: faker.internet.email(),
};

export const DRIVER_LOCATION_TYPE = {
  name: faker.name.firstName(),
  username: faker.internet.email(),
  truck: {
    id: 10,
    name: 'El Coche',
    type: 'LOCATION',
  },
};

/**
 * @function generateDriver
 * @param {string} name the name of the driver
 * @param {string} username the email address of the driver
 * @param {string} photo the avatar of the driver
 * @returns {Object} driver
 */
export const generateDriver = ({
  name = faker.name.firstName(),
  username = faker.internet.email(),
  photo = faker.internet.avatar(),
} = {}) => ({
  name,
  username,
  photo,
});
