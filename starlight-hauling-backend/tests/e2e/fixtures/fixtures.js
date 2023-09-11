import dummyjson from 'dummy-json';

import { toSlug } from '../../../utils/textTransforms.js';

import { REGIONS } from '../../../consts/regions.js';

const templateHelpers = {
  location_type: () => dummyjson.utils.randomArrayItem(['Point']),
  region: () => dummyjson.utils.randomArrayItem(REGIONS),
  coordinates: () => [
    // mapbox has reverted order of coordinates
    dummyjson.helpers.float(-126, -64, '0.0000', { hash: {} }),
    dummyjson.helpers.float(24, 51, '0.0000', { hash: {} }),
  ],
  company_slug: options => toSlug(dummyjson.helpers.company(options)),
};
const templatePartials = {
  location: `{
        "type": "{{location_type}}",
        "coordinates": [{{coordinates}}]
    }`,
  address: `{
        "addressLine1": "{{street}}",
        "zip": "{{zipcode}}",
        "city": "{{city}}",
        "state": "{{countryCode}}"
    }`, // "state" uses countryCode code like a code here just as the most similar helper
  job_site: `{
        "location": {{> location}},
        "address": {{> address}},
        "alleyPlacement": {{boolean}},
        "cabOver": {{boolean}}
    }`,
  tenant: `{
        "name": "{{company_slug}}",
        "legalName": "{{company}}",
        "rootEmail": "{{email}}",
        "region": "{{region}}"
    }`,
};
const template = `{
      "jobSite": {{> job_site}},
      "tenant": {{> tenant}}
    }`;
const fixtures = JSON.parse(
  dummyjson.parse(template, {
    helpers: templateHelpers,
    partials: templatePartials,
  }),
);

const adminCredentials = {
  email: 'admin.hauling@starlightpro.net',
  password: 'starlightdevpwd111',
};

const adminUser = {
  email: 'admin.hauling@starlightpro.net',
  role: 'admin',
  subscriberName: null,
  subscriberLegalName: null,
};

const csrCredentials = {
  email: 'dev.hauling@starlight.starlightpro.net',
  password: 'starlightdevpwd111',
};
const csrUser = {
  email: 'dev.hauling@starlight.starlightpro.net',
  role: 'csr',
  subscriberName: 'starlight',
  subscriberLegalName: 'Starlight Inc.',
  company: {
    logoUrl: 'https://starlight-dev1-files.s3.amazonaws.com/companies/starlight/1',
    companyNameLine1: 'Dev1',
    companyNameLine2: 'dev',
  },
  name: 'dev hauling',
};
const testCredentials = {
  email: 'test.csr@starlight.starlightpro.net',
  password: 'stDde!d111',
};
const testUser = {
  email: 'test.csr@starlight.starlightpro.net',
  role: 'csr',
  subscriberName: 'starlight',
  subscriberLegalName: 'Starlight Inc.',
  company: {
    logoUrl: 'https://starlight-dev1-files.s3.amazonaws.com/companies/starlight/1',
    companyNameLine1: 'Dev1',
    companyNameLine2: 'dev',
  },
  name: 'dev hauling',
};

const adminAccessTokenData = {
  tenantId: null,
};

const csrAccessTokenData = {
  id: 3,
  tenantId: 1,
  userId: 1,
};

export default {
  ...fixtures,
  adminCredentials,
  csrCredentials,
  adminUser,
  csrUser,
  adminAccessTokenData,
  csrAccessTokenData,
  testCredentials,
  testUser,
};
