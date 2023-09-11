import { Next } from 'koa';
import { Middleware } from 'koa-compose';
import { BaseEntity } from 'typeorm';
import { Context } from '../types/Context';
import { getTenantEntitiesAndConnection } from '../tenancy';

export interface TenantMiddlewareOptions {
  entities?: typeof BaseEntity[];
}

export default (options?: TenantMiddlewareOptions): Middleware<Context> => {
  const tenantEntities = options?.entities;

  return async (ctx: Context, next: Next): Promise<void> => {
    // TODO figure out a way to detect a tenant
    const schemaName = ctx.userInfo?.resource || ctx.serviceToken?.resource || ctx.resource; // is a tenant in cores

    if (schemaName) {
      const [, schemaEntities] = await getTenantEntitiesAndConnection(schemaName, tenantEntities, [
        __dirname + '/../modules/recycling/migrations/**/!(*.spec.ts)',
      ]);

      Object.assign(ctx, schemaEntities);
    }

    await next();
  };
};
