import { Next, Context } from 'koa';
import * as Router from 'koa-router';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { BaseController } from '../controllers/base.controller';

const router = new Router();

const createTableOnSchema = async (schemaName: string) => {
  const database: DataSource = await BaseController.getDataSource(schemaName);
  await database.synchronize();
};

router.post('/', async (ctx: Context, next: Next) => {
  const tenantName: string = ctx.request.body.tenantName;
  try {
    await AppDataSource.createQueryRunner().createSchema(tenantName, true);
    await createTableOnSchema(tenantName);
    ctx.body = `Tenant ${tenantName} created with success`;
    ctx.status = 200;
  } catch (error: unknown) {
    ctx.body = `schema ${tenantName} already exists ${error}`;
    ctx.status = 400;
  }
  return next();
});

export default router.routes();
