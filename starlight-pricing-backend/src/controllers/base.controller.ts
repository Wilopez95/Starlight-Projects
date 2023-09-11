import { Entity, InsertResult, ObjectType, In, DataSource, ObjectLiteral } from 'typeorm';
import { Next } from 'koa';
import { isEmpty } from 'lodash';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, DB_LOGGING } from '../config/config';
import Entities from '../database/entities/_entitiesTenant';
import { Context } from '../Interfaces/Auth';

export class BaseController {
  static async getDataSource(schemaName: string, logging: boolean = Boolean(DB_LOGGING)) {
    const dataSource: DataSource = new DataSource({
      type: 'postgres',
      host: DB_HOST,
      port: Number(DB_PORT),
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      entities: Entities.entities,
      schema: schemaName,
      logging,
    });
    await dataSource.initialize();
    return dataSource;
  }

  async getAll(ctx: Context, next: Next, type: ObjectType<typeof Entity>) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.find(type);
    ctx.body = data;
    ctx.status = 200;
    await dataSource.destroy();
    return next();
  }

  async getBy(ctx: Context, next: Next, type: ObjectType<typeof Entity>) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.find(type, ctx.request.body as object);
    ctx.body = data;
    ctx.status = 200;
    await dataSource.destroy();
    return next();
  }
  async getDataBy(ctx: Context, type: ObjectType<typeof Entity>) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const tmp = await dataSource.manager.find(type, ctx.request.body as object);
    await dataSource.destroy();
    return tmp;
  }

  async insert(
    ctx: Context,
    next: Next,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
  ) {
    let input: object = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const response: InsertResult = await dataSource.manager.insert(type, input);
    const responseItem = response.identifiers.pop();
    ctx.body = 'OK';

    ctx.status = 200;
    if (responseItem) {
      const body = await dataSource.manager.findOne(type, {
        where: { id: responseItem.id },
      });
      ctx.body = body;
      if (historicalType) {
        input = {
          ...body,
          ...BaseController.historicalAttributes('created', responseItem.id as number, ctx),
        };
        await dataSource.manager.insert(historicalType, input);
      }
    }
    await dataSource.destroy();
    return next();
  }

  async insertMany(
    ctx: Context,
    next: Next,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
  ) {
    let input: object = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const response: InsertResult = await dataSource.manager.insert(type, input);
    const responseItem: ObjectLiteral[] = response.identifiers;
    const responseArray: ObjectLiteral[] | null = [];

    ctx.status = 200;
    if (!isEmpty(responseItem)) {
      for (let index = 0; index < responseItem.length; index++) {
        const body: ObjectLiteral | null = await dataSource.manager.findOne(type, {
          where: { id: responseItem[index].id },
        });
        if (!body) {
          return;
        }
        responseArray.push(body);
        if (historicalType) {
          input = {
            ...body,
            ...BaseController.historicalAttributes(
              'created',
              responseItem[index]?.id as number,
              ctx,
            ),
          };
          await dataSource.manager.insert(historicalType, input);
        }
      }
    }
    await dataSource.destroy();
    ctx.body = responseArray;
    return next();
  }

  async insertVoid(
    ctx: Context,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
  ) {
    let input: object = ctx.request.body;
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const response: InsertResult = await dataSource.manager.insert(type, input);
    const responseItem = response.identifiers.pop();
    if (responseItem) {
      const body = await dataSource.manager.findOne(type, {
        where: { id: responseItem.id },
      });
      if (historicalType) {
        input = {
          ...body,
          ...BaseController.historicalAttributes('created', responseItem.id as number, ctx),
        };
        await dataSource.manager.insert(historicalType, input);
      }
    }
    await dataSource.destroy();
  }

  async bulkInsert(
    ctx: Context,
    next: Next,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
  ) {
    const input: object = ctx.request.body;
    const dataSource = await BaseController.getDataSource(ctx.state.user.tenantName as string);
    const insertResult = await dataSource.manager.insert(type, input);
    const insertResultIds: ObjectLiteral[] = insertResult.identifiers;

    if (historicalType) {
      const ids: number[] = insertResultIds.map(item => item.id);
      const createdElements = await dataSource.manager.find(type, {
        where: { id: In(ids) },
      });

      const historicalElements = createdElements.map((element, i) => {
        return {
          ...element,
          ...BaseController.historicalAttributes('created', ids[i], ctx),
        };
      });
      await dataSource.manager.insert(historicalType, historicalElements);
    }
    await dataSource.destroy();

    ctx.status = 200;
    ctx.body = insertResultIds;

    return next();
  }

  async bulkInserts(
    ctx: Context,
    next: Next,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
  ) {
    const input: object = ctx.request.body;
    const dataSource = await BaseController.getDataSource(ctx.state.user.tenantName as string);
    const insertResult = await dataSource.manager.insert(type, input);
    const ids: number[] = insertResult.identifiers.map(result => result.id);
    const createdElements = await dataSource.manager.find(type, {
      where: { id: In(ids) },
    });

    if (historicalType) {
      const historicalElements = createdElements.map((element, i) => {
        return {
          ...element,
          ...BaseController.historicalAttributes('created', ids[i], ctx),
        };
      });
      await dataSource.manager.insert(historicalType, historicalElements);
    }
    await dataSource.destroy();

    ctx.status = 200;
    ctx.body = createdElements;

    return next();
  }

  async updateVoid(
    ctx: Context,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
    id_query: number | undefined = undefined,
  ) {
    const input: object = ctx.request.body;
    let id: number;
    if (id_query) {
      id = id_query;
    } else {
      id = Number(ctx.query.id);
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.update(type, { id }, input);
    const data = await dataSource.manager.findOneBy(type, { id });
    if (historicalType) {
      const historical = {
        ...data,
        ...BaseController.historicalAttributes('edited', id, ctx),
      };
      await dataSource.manager.insert(historicalType, historical);
    }
    await dataSource.destroy();
  }

  async update(
    ctx: Context,
    next: Next,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
    id_query: number | undefined = undefined,
  ) {
    const input: object = ctx.request.body;
    let id: number = parseInt(ctx.request.url.split('/')[4], 10);
    if (id_query) {
      id = id_query;
    }

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    await dataSource.manager.update(type, { id }, input);
    const data = await dataSource.manager.findOneBy(type, { id });
    ctx.body = data;
    ctx.status = 200;
    if (historicalType) {
      const historical = {
        ...data,
        ...BaseController.historicalAttributes('edited', id, ctx),
      };
      await dataSource.manager.insert(historicalType, historical);
    }
    await dataSource.destroy();
    //return next();
  }

  async delete(
    ctx: Context,
    next: Next,
    type: ObjectType<typeof Entity>,
    historicalType: ObjectType<typeof Entity> | undefined = undefined,
  ) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data: ObjectLiteral | null = await dataSource.manager.findOneBy(
      type,
      ctx.request.body as object,
    );
    //Validate if exist any item before the delete action
    if (!isEmpty(data)) {
      await dataSource.manager.delete(type, ctx.request.body);
      if (historicalType) {
        const historical = {
          ...(data as object),
          ...BaseController.historicalAttributes('deleted', data.id as number, ctx),
        };
        await dataSource.manager.insert(historicalType, historical);
      }
    }
    await dataSource.destroy();
    ctx.body = 'OK';
    ctx.status = 200;
    return next();
  }

  async execQuery(query: string, ctx: Context) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const data = await dataSource.manager.query(query);
    await dataSource.destroy();
    return data;
  }

  static historicalAttributes(
    eventType: 'created' | 'edited' | 'deleted',
    original_id: number | undefined = undefined,
    ctx: Context,
  ) {
    return {
      originalId: original_id ? original_id : 1,
      eventType,
      userId: ctx.state.user.id ?? 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      traceId: ctx.state.reqId,
    };
  }
}
