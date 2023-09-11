import camelCase from 'lodash/camelCase.js';

import { publisher as customers } from './indices/customers/publisher.js';
import { publisher as jobSites } from './indices/jobSites/publisher.js';
import { publisher as recyclingFacilities } from './indices/recyclingFacilities/publisher.js';
import { publisher as subscriptions } from './indices/subscriptions/publisher.js';

export const publishers = {
  customers,
  jobSites,
  recyclingFacilities,
  subscriptions,
};

export const exec = async (ctx, { templateName, level, tenants, alias }) => {
  const publisher = publishers[camelCase(templateName)];

  if (level === 'tenant') {
    await publisher(ctx, tenants[0], alias);
  } else if (level === 'root' && tenants?.length) {
    await Promise.all(tenants.map(t => publisher(ctx, t, alias)));
  }
};
