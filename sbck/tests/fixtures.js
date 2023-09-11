import dummyjson from 'dummy-json';

import { toSlug } from '../utils/textTransforms.js';

const templateHelpers = {
  company_slug: options => toSlug(dummyjson.helpers.company(options)),
};
const templatePartials = {
  tenant: `{
        "name": "{{company_slug}}",
        "legalName": "{{company}}"
    }`,
};
const template = `{
      "tenant": {{> tenant}}
    }`;
const fixtures = JSON.parse(
  dummyjson.parse(template, {
    helpers: templateHelpers,
    partials: templatePartials,
  }),
);

const adminUser = {
  email: 'admin.hauling@starlightpro.net',
  role: 'admin',
  subscriberName: null,
  subscriberLegalName: null,
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
  adminUser,
  adminAccessTokenData,
  csrUser,
  csrAccessTokenData,
};
