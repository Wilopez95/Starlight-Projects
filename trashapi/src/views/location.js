import R from 'ramda';
import constants from '../utils/constants.js';

const {
  location: {
    type: { TRUCK },
  },
} = constants;
// import _debug from 'debug';

// const debug = _debug('api:views:location');
// safeProp :: String -> Object
// safeProp('a', undefined)
// > null
// safeProp('a', {a: 1})
// > 1
// const safeProp = R.uncurryN(2, prop => o(
//   R.propOr(null, prop), R.defaultTo({})
// ));

// assocPropTo :: String -> String -> Object -> Object
// assocPropTo('a', 'b', {b: 1})
// > {a: 1}
// const assocPropTo = R.uncurryN(3, newProp => oldProp => R.pipe(
//   R.converge(R.assoc(newProp), [safeProp(oldProp), R.identity]),
//   R.omit([oldProp])
// ));

// mapCoords :: String -> String -> Object -> Object
// mapCoords('lat', 'y', {location: {y: 2}})
// > {location: {lat: 2}}
// const mapCoords = R.uncurryN(3, coord => point =>
//   R.over(R.lensProp('location'), assocPropTo(coord, point))
// );

const locationView = (obj, mutate = false) => {
  // debug('locationView obj: ', obj);

  const retObj = mutate ? obj : R.clone(obj);
  if (retObj.location) {
    if (retObj.location.x) {
      retObj.location.lon = retObj.location.x;
      delete retObj.location.x;
    } else {
      retObj.location.lon = null;
    }

    if (retObj.location.y) {
      retObj.location.lat = retObj.location.y;
      delete retObj.location.y;
    } else {
      retObj.location.lat = null;
    }
  } else if (retObj.latitude && retObj.longitude) {
    retObj.location = { lon: retObj.longitude, lat: retObj.latitude };
  } else {
    retObj.location = { lon: null, lat: null };
  }
  return retObj;
};

export const locationExtractor = row => {
  const locationOrig = {
    id: row.locationId,
    name: row.locationName,
    description: row.locationDescription,
    type: row.locationType,
    waypointType: row.locationWaypointType,
    waypointName: row.locationWaypointName,
    location: row.locationLocation,
    latitude: row.locationLatitude,
    longitude: row.locationLongitude,
    createdBy: row.locationCreatedBy,
    createdDate: row.locationCreatedDate,
    modifiedBy: row.locationModifiedBy,
    modifiedDate: row.locationModifiedDate,
  };
  return { location: locationView(locationOrig, true) };
};

export const locationPrevLocationExtractor = row => {
  const prevLocationOrig = {
    id: row.prevLocationId,
    name: row.prevLocationName,
    description: row.prevLocationDescription,
    type: row.prevLocationType,
    waypointType: row.prevLocationWaypointType,
    waypointName: row.prevLocationWaypointName,
    location: row.prevLocationLocation,
    latitude: row.prevLocationLatitude,
    longitude: row.prevLocationLongitude,
    createdBy: row.prevLocationCreatedBy,
    createdDate: row.prevLocationCreatedDate,
    modifiedBy: row.prevLocationModifiedBy,
    modifiedDate: row.prevLocationModifiedDate,
  };

  return {
    ...locationExtractor(row),
    prevLocation: locationView(prevLocationOrig, true),
  };
};

export const location1Location2Extractor = row => {
  const location1Orig = {
    id: row.locationId1,
    name: row.locationName1,
    description: row.locationDescription1,
    type: row.locationType1,
    waypointType: row.locationWaypointType1,
    waypointName: row.locationWaypointName1,
    location: row.locationLocation1,
    latitude: row.locationLatitude1,
    longitude: row.locationLongitude1,
    createdBy: row.locationCreatedBy1,
    createdDate: row.locationCreatedDate1,
    modifiedBy: row.locationModifiedBy1,
    modifiedDate: row.locationModifiedDate1,
  };
  const location2Orig = {
    id: row.locationId2,
    name: row.locationName2,
    description: row.locationDescription2,
    type: row.locationType2,
    waypointType: row.locationWaypointType2,
    waypointName: row.locationWaypointName2,
    location: row.locationLocation2,
    latitude: row.locationLatitude2,
    longitude: row.locationLongitude2,
    createdBy: row.locationCreatedBy2,
    createdDate: row.locationCreatedDate2,
    modifiedBy: row.locationModifiedBy2,
    modifiedDate: row.locationModifiedDate2,
  };
  const suspensionLocationOrig = {
    id: row.suspensionLocationId,
    name: row.suspensionLocationName,
    description: row.suspensionLocationDescription,
    type: row.suspensionLocationType,
    waypointType: row.suspensionLocationWaypointType,
    waypointName: row.suspensionLocationWaypointName,
    location: row.suspensionLocationLocation,
    latitude: row.suspensionLocationLatitude,
    longitude: row.suspensionLocationLongitude,
    createdBy: row.suspensionLocationCreatedBy,
    createdDate: row.suspensionLocationCreatedDate,
    modifiedBy: row.suspensionLocationModifiedBy,
    modifiedDate: row.suspensionLocationModifiedDate,
  };
  return {
    location1: locationView(location1Orig, true),
    location2: locationView(location2Orig, true),
    suspensionLocation: locationView(suspensionLocationOrig, true),
  };
};

// :: Object -> Object
// locationView({
//   location: {x: 1, y: 2}
// })
// > {
//   location: {lon: 1, lat: 2}
// }

export const toHaulingLocation = location => {
  if (!location) {
    return null;
  }
  if (location?.coords) {
    const { latitude, longitude } = location?.coords ?? {};
    return {
      ...location,
      type: 'Point',
      coordinates: [longitude, latitude],
    };
  }
  const { lat, lon, latitude, longitude, coordinates, type } = location ?? {};
  return {
    ...location,
    type: type ?? 'Point',
    coordinates: coordinates ?? [longitude ?? lon, latitude ?? lat],
  };
};

export const fromHaulingToTruckLocation = location => {
  if (!location) {
    return location;
  }

  const {
    lat,
    lon,
    latitude,
    longitude,
    coordinates: [pointLongitude, pointLatitude] = [],
  } = location ?? {};

  return {
    ...location,
    name: location?.name ?? `GPS_${new Date().getTime()}`,
    type: TRUCK,
    latitude: lat ?? latitude ?? pointLatitude,
    longitude: lon ?? longitude ?? pointLongitude,
  };
};

export const fromHaulingToDispatchCoordinates = location => {
  const { coordinates: [pointLongitude, pointLatitude] = [] } = location ?? {};
  return {
    lat: pointLatitude ?? null,
    lon: pointLongitude ?? null,
  };
};

export default locationView;
