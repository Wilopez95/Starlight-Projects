import constants from '../utils/constants.js';

const {
  location: {
    type: { TRUCK },
  },
} = constants;

export const truckView = (truck = {}) => {
  if (!truck) {
    return truck;
  }

  const { location = {} } = truck;
  const { coordinates: [longitude = null, latitude = null] = [] } = location ?? {};
  const truckLocation = {
    ...location,
    lon: longitude,
    longitude,
    lat: latitude,
    latitude,
    type: TRUCK,
  };

  if (!longitude || !latitude) {
    truckLocation.name = 'Unknown location';
  }

  return {
    ...truck,
    location: truckLocation,
  };
};

export const trucksListView = trucks => trucks?.map(truck => truckView(truck));

export default truckView;
