import httpStatus from 'http-status';

import { createAppContext } from '../../../utils/koaContext.js';

import { reset } from '../../../services/elasticsearch/ElasticSearch.js';
import client from '../client.js';
import fixtures from '../fixtures/fixtures.js';

import { TENANT_INDICES } from '../../../consts/searchIndices.js';

const resetIndex = async () => {
  const ctx = createAppContext({ dontCheckToken: true });
  const res = await reset(ctx, TENANT_INDICES);
  expect(res).toBeTruthy();
};

const resyncIndex = async () => {
  const { statusCode } = await client
    .put(`admin/search/resync`)
    .set('Cookie', fixtures.adminAccessTokenCookie)
    .send({});
  expect(statusCode).toEqual(httpStatus.OK);
};

const createJobSite = async () => {
  const { statusCode, body } = await client
    .post('job-sites')
    .set('Cookie', fixtures.csrAccessTokenCookie)
    .send(fixtures.jobSite);
  expect(statusCode).toEqual(httpStatus.CREATED);
  expect(body).toHaveProperty('id');
  expect(body).toHaveProperty('location');
  expect(body).toHaveProperty('address');
  expect(body).toHaveProperty('alleyPlacement');
  expect(body).toHaveProperty('cabOver');
  expect(typeof body.id).toBe('number');
  expect(body.alleyPlacement).toEqual(fixtures.jobSite.alleyPlacement);
  expect(body.cabOver).toEqual(fixtures.jobSite.cabOver);
  expect(body.location).toHaveProperty('type');
  expect(body.location).toHaveProperty('coordinates');
  expect(body.address).toHaveProperty('addressLine1');
  expect(body.address).toHaveProperty('zip');
  expect(body.address).toHaveProperty('city');
  expect(body.address).toHaveProperty('state');
  expect(body.address.addressLine1).toEqual(fixtures.jobSite.address.addressLine1);
  expect(body.address.zip).toEqual(fixtures.jobSite.address.zip);
  expect(body.address.city).toEqual(fixtures.jobSite.address.city);
  expect(body.address.state).toEqual(fixtures.jobSite.address.state);
  return body.id;
};

const succeedOrderCreationInitialSearchForJobSiteByAddress = async id => {
  const { statusCode, body } = await client
    .get(`search/multi?query=${fixtures.jobSite.address.addressLine1}`)
    .set('Cookie', fixtures.csrAccessTokenCookie);
  expect(statusCode).toEqual(httpStatus.OK);
  expect(body).toHaveProperty('jobSites');
  expect(Array.isArray(body.jobSites)).toBe(true);
  expect(body.jobSites.length >= 1).toBe(true);
  const newJobSites = body.jobSites.find(i => String(i?.id) === String(id));
  expect(newJobSites).toBeTruthy();
  expect(newJobSites).toHaveProperty('location');
  expect(newJobSites).toHaveProperty('address');
  expect(newJobSites).toHaveProperty('highlight');
  expect(newJobSites.highlight).toHaveProperty('address');
  expect(Array.isArray(newJobSites.highlight.address)).toBe(true);
  expect(newJobSites.highlight.address.length).toBe(1);
};

const failOrderCreationInitialSearchForJobSiteByAddress = async id => {
  const { statusCode, body } = await client
    .get(`search/multi?query=${fixtures.jobSite.address.addressLine1}`)
    .set('Cookie', fixtures.csrAccessTokenCookie);
  expect(statusCode).toEqual(httpStatus.OK);
  expect(body).toHaveProperty('jobSites');
  expect(Array.isArray(body.jobSites)).toBe(true);
  const newJobSites = body.jobSites.find(i => String(i?.id) === String(id));
  expect(newJobSites).toBeFalsy();
};

describe('Admin Elasticsearch Management Flow', () => {
  it(`should create a jobsite,
        then succeed to find new jobsite on order creation initial search by address,
        then drop index,
        then fail to find new jobsite on order creation initial search by address,
        then resync index,
        then succeed to find new jobsite on order creation initial search by address`, async () => {
    const id = await createJobSite();
    // wait for queued job to complete
    await new Promise(resolve => setTimeout(() => resolve(), 1000));
    await succeedOrderCreationInitialSearchForJobSiteByAddress(id);
    await resetIndex();
    await failOrderCreationInitialSearchForJobSiteByAddress(id);
    await resyncIndex();
    // wait for heavy queued job to complete
    await new Promise(resolve => setTimeout(() => resolve(), 5000));
    await succeedOrderCreationInitialSearchForJobSiteByAddress(id);
  });
  // TODO: extend jobsite flow, implement customer flow, tax distinct flow, contact flow
  // jobsite on order creation initial search by city
  // jobsite on order creation initial search by zip
  // jobsite on global search by address
  // jobsite on global search by city
  // jobsite on global search by zip
  // jobsite on jobsites search by address
  // jobsite on customers jobsites search by address
  // customer on order creation initial search by name
  // customer on order creation initial search by email
  // customer on order creation initial search by phoneNumber
  // customer on order creation initial search by contactName
  // customer on order creation initial search by contactEmail
  // customer on order creation initial search by contactPhoneNumber
  // customer on global search by name
  // customer on global search by email
  // customer on global search by phoneNumber
  // customer on global search by contactName
  // customer on global search by contactEmail
  // customer on global search by contactPhoneNumber
  // customer on customers search by name
  // customer on customers simple search by name
  // customer on customers simple search by email
  // customer on customers simple search by phoneNumber
  // customer on customers simple search by contactName
  // customer on customers simple search by contactEmail
  // customer on customers simple search by contactPhoneNumber
});
