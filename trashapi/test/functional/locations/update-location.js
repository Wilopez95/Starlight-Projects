import assert from 'assert';
import R from 'ramda';

import { my } from '../../../src/utils/query';
import locations from '../../../src/tables/locations';
import locationView from '../../../src/views/location';
import { humanReadableDBError } from '../../../src/models/locations';

import { notFound, invalid } from '../common';
import { body, expect } from '../../helpers/request';
import { up, clear } from '../../helpers/data';
import mockLocation from '../../fixtures/location';

export const before = up(locations)(mockLocation());
export const after = clear;

const clean = R.omit([
  'name',
  'type',
  'location',
  'waypointType',
  'createdDate',
  'modifiedDate',
  'modifiedBy',
]);

const testHelperForNameAndLocation = (
  { name, location, type },
  isError,
) => async (request, api) => {
  const {
    body: [allreadyCreatedLocation],
  } = await api.listLocations();
  const toUpdate = {
    name: name || allreadyCreatedLocation.name,
    location: location || allreadyCreatedLocation.location,
    type: type || allreadyCreatedLocation.type,
  };
  const toCreate = R.omit(['id'], {
    ...clean(allreadyCreatedLocation),
    name: mockLocation().name,
    location: allreadyCreatedLocation.location,
    type: allreadyCreatedLocation.type,
  });
  const { body: allreadyCreatedLocation2 } = await api
    .createLocation()
    .send(toCreate);

  if (isError) {
    const error = await body(
      request({ locationId: allreadyCreatedLocation2.id }).send(toUpdate),
    );

    // it should return a human readable database error message
    assert.deepEqual(
      error,
      humanReadableDBError({ code: '23505' }, toUpdate),
    );
    assert.equal(error.code, 400);
  } else {
    await expect(
      202,
      request({ locationId: allreadyCreatedLocation2.id }).send(toUpdate),
    );
  }
  await api.deleteLocation({ locationId: allreadyCreatedLocation2.id });
};

export default {
  'update location': async request => {
    const [locationBefore] = await my(locations.select());
    assert(locationBefore);

    const name = 'New test name';

    const coordinates = {
      lat: 123,
      lon: 23,
    };

    const type = 'TYPE';

    const waypointType = 'waypointType';

    const locationAfter = await body(
      expect(
        202,
        request({ locationId: locationBefore.id }).send({
          name,
          location: coordinates,
          type,
          waypointType,
        }),
      ),
    );

    assert(locationAfter);
    assert.deepEqual(clean(locationView(locationBefore)), clean(locationAfter));
    assert.equal(locationAfter.name, name);
    assert.deepEqual(locationAfter.location, coordinates);
    assert.equal(locationAfter.type, type);
    assert.equal(locationAfter.waypointType, waypointType);
  },

  'update location with min changes': async request => {
    const [locationBefore] = await my(locations.select());
    assert(locationBefore);

    const name = 'New test name';

    const locationAfter = await body(
      expect(202, request({ locationId: locationBefore.id }).send({ name })),
    );

    assert(locationAfter);
    assert.deepEqual(clean(locationView(locationBefore)), clean(locationAfter));
    assert.equal(locationAfter.name, name);
  },

  'not found': notFound(locations, 'locationId', 'id'),

  invalid: invalid('locationId'),
  'API-195 - should be failed on update location with existed name and coordinates': testHelperForNameAndLocation(
    {},
    true,
  ),
  'API-195 - should update location with same name and different coordinates': testHelperForNameAndLocation(
    { location: { lat: 444, lon: 55559 } },
  ),
  'API-195 - should update location with same coordinate and different names': testHelperForNameAndLocation(
    { name: 'abra cadabra boom' },
  ),
};
