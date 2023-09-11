import assert from 'assert';
import R from 'ramda';
import { expect, body } from '../../helpers/request';
import { clear } from '../../helpers/data';
import mockLocation from '../../fixtures/location';
import constants from '../../../src/utils/constants';
import { humanReadableDBError } from '../../../src/models/locations';

const {
  location: {
    type: { LOCATION, TRUCK },
    waypointType: { HOME_YARD },
  },
} = constants;

export const after = clear;

const clean = R.omit([
  'id',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
]);

export default {
  'create work order': async (request, api) => {
    const mock = mockLocation(LOCATION, false, '', HOME_YARD, 'Airport');
    const created = await body(expect(201, request().send(mock)));
    assert.equal(mock.name, created.name);
    assert.equal(mock.type, created.type);
    assert.equal(mock.waypointName, created.waypointName);
    assert.equal(mock.waypointType, created.waypointType);
    assert.deepEqual(mock.location, created.location);
    const locations = await body(api.listLocations());
    const listed = R.find(R.propEq('id', created.id), locations);
    assert.deepEqual(created, listed);
  },
  'API-195 - should return existed location on creation location with existed name and coordinates': async (
    request,
    api,
  ) => {
    const mock = mockLocation(LOCATION, false, '', HOME_YARD, 'Airport');
    const { body: allreadyCreatedLocation } = await request().send(mock);

    const created = await body(expect(201, request().send(mock)));
    assert.deepEqual(clean(created), clean(allreadyCreatedLocation));
    await api.deleteLocation({ locationId: created.id });
  },
  'API-195 - should create location with same name and different coordinates': async (
    request,
    api,
  ) => {
    const mock = mockLocation(LOCATION, false, '', HOME_YARD, 'Airport');
    const { body: allreadyCreatedLocation } = await request().send(mock);
    const x = {
      ...mock,
      location: {
        lon: 44.22,
        lat: 55.33,
      },
    };
    const { body: created } = await request().send(x);
    assert.notDeepEqual(created.location, allreadyCreatedLocation.location);
    assert.equal(created.name, allreadyCreatedLocation.name);
    await api.deleteLocation({ locationId: created.id });
  },
  'API-195 - should create location with same coordinate and different names': async (
    request,
    api,
  ) => {
    const mock = mockLocation(LOCATION, false, '', HOME_YARD, 'Airport');
    const { body: allreadyCreatedLocation } = await request().send(mock);

    const created = await body(
      expect(
        201,
        request().send({
          ...mock,
          name: 'abra cadabra boom',
        }),
      ),
    );
    assert.deepEqual(created.location, allreadyCreatedLocation.location);
    assert.notEqual(created.name, allreadyCreatedLocation.name);
    await api.deleteLocation({ locationId: created.id });
  },

  'API-239 - should lookup for existing location by LOCATION type by default': async (
    request,
    api,
  ) => {
    const mock = mockLocation(LOCATION, false, '', HOME_YARD, 'Airport');
    const { body: alreadyCreatedLocation } = await request().send(mock);

    const created = await body(
      expect(
        201,
        request().send({
          ...mock,
          type: null,
        }),
      ),
    );

    assert.deepEqual(created.location, alreadyCreatedLocation.location);
    assert.equal(created.id, alreadyCreatedLocation.id);
    await api.deleteLocation({ locationId: created.id });
  },

  'API-239 - should lookup for existing location by type': async (
    request,
    api,
  ) => {
    const mock = mockLocation(TRUCK, false, '', HOME_YARD, 'Airport');
    const { body: alreadyCreatedLocation } = await request().send(mock);

    const created = await body(
      expect(
        201,
        request().send({
          ...mock,
          type: TRUCK,
        }),
      ),
    );

    assert.deepEqual(created.location, alreadyCreatedLocation.location);
    assert.equal(created.id, alreadyCreatedLocation.id);
    await api.deleteLocation({ locationId: created.id });
  },

  'test humanReadableDBError': () => {
    const error = new Error(1111);
    assert.deepEqual(error, humanReadableDBError(error));
  },
};
