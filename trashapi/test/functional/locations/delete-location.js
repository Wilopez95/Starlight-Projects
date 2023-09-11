import assert from 'assert';
import R from 'ramda';
import { invalid } from '../common';
import { up, clear } from '../../helpers/data';
import mockLocation from '../../fixtures/location';
import { my } from '../../../src/utils/query';
import locations from '../../../src/tables/locations';
import locationView from '../../../src/views/location';

const clean = R.omit([
  'id',
  'createdBy',
  'createdDate',
  'modifiedBy',
  'modifiedDate',
  'deleted',
]);

export const beforeEach = up(locations)(mockLocation('LOCATION'));
export const afterEach = clear;

export default {
  'delete location': async request => {
    const [locationBefore] = await my(locations.select());
    assert(locationBefore);
    const id = locationBefore.id;

    await request({ locationId: id }).expect(204);

    const locationsList = await my(locations.select().where({ id }));
    assert(locationsList.length === 1);
    assert(locationsList[0].deleted === 1);
  },

  'API-239 - should set deleted flag to 0 on location if user tries to recreate deleted location': async (
    request,
    api,
  ) => {
    const [locationBefore] = await my(locations.select());
    assert(locationBefore);
    const id = locationBefore.id;

    await request({ locationId: id }).expect(204);
    const locationsList = await my(locations.select().where({ id }));
    assert(locationsList.length === 1);
    assert(locationsList[0].deleted === 1);

    const location = clean(locationView(locationsList[0]));
    const { body: recreated } = await api
      .createLocation()
      .send({ ...location });
    assert(recreated.deleted === 0);
    assert(locationsList[0].id === recreated.id);

    const [updatedLocation] = await my(
      locations.select().where({ id: locationsList[0].id }),
    );
    assert(locationsList[0].id === updatedLocation.id);
    assert(updatedLocation.deleted === 0);
  },

  'not found': async request => {
    await request({ locationId: '456748' }).expect(204);
  },

  invalid: invalid('locationId'),
};
