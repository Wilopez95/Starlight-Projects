/* eslint-disable import/no-cycle */
import * as allModels from '../models/index.js';

const { Tenant, ...tenantModels } = allModels;
const nonTenantModels = { Tenant };

export const getScopedContextModels = (ctx, globalSchemaKey) => {
  const schemaName =
    ctx &&
    (ctx.state.user?.schemaName ||
      ctx.state.user?.subscriberName ||
      ctx.state.schemaName ||
      ctx.schemaName);

  if (schemaName === globalSchemaKey) {
    return nonTenantModels;
  }

  const models = {
    ...nonTenantModels,
  };
  Object.entries(tenantModels).forEach(([name, ModelClass]) => {
    class BoundModel extends ModelClass {
      static get models() {
        return models;
      }

      static get appContext() {
        return ctx;
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
