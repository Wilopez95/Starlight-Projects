import * as allModels from '../models/index.js';

import dbConfig from '../db/dbConfig.js';

const { Tenant, Company, QBConfiguration, QBAccount, QBIntegrationLog, ...tenantModels } =
  allModels;
const nonTenantModels = { Tenant, Company, QBConfiguration, QBAccount, QBIntegrationLog };

export const getScopedModels = schemaName => {
  const models = {};

  Object.entries(nonTenantModels).forEach(([name, ModelClass]) => {
    class BoundModel extends ModelClass {
      static get models() {
        return nonTenantModels;
      }

      static get schemaName() {
        return dbConfig.internalSchema;
      }
    }

    Object.defineProperty(BoundModel, 'name', {
      value: `BoundGlobal${name}`,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    models[name] = BoundModel;
  });

  if (!schemaName) {
    return models;
  }

  Object.entries(tenantModels).forEach(([name, ModelClass]) => {
    class BoundModel extends ModelClass {
      static get models() {
        return models;
      }

      static get schemaName() {
        return schemaName;
      }
    }

    Object.defineProperty(BoundModel, 'name', {
      value: `Bound${name}`,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    models[name] = BoundModel;
  }, {});

  return models;
};
