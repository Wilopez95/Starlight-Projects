import { Next } from 'koa';
import { Not, IsNull, InsertResult, DataSource } from 'typeorm';
import { isEmpty } from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { PriceGroups } from '../../database/entities/tenant/PriceGroups';
import { BaseController } from '../base.controller';
import { Prices } from '../../database/entities/tenant/Prices';
import { IBody, IWhere } from '../../Interfaces/GeneralsFilter';
import { Context } from '../../Interfaces/Auth';
import { PriceGroupsHistorical } from './../../database/entities/tenant/PriceGroupsHistorical';

export class PriceGroupController extends BaseController {
  async getPriceGroup(ctx: Context, next: Next) {
    return super.getAll(ctx, next, PriceGroups);
  }

  async getPriceGroupByType(ctx: Context, next: Next) {
    const where: IWhere = {};
    const body: IBody = {};

    if (ctx.request.query.businessUnitId) {
      where.businessUnitId = +ctx.request.query.businessUnitId;
    }

    if (ctx.request.query.businessLineId) {
      where.businessLineId = +ctx.request.query.businessLineId;
    }

    if (ctx.request.query.skip) {
      const skip: number = +ctx.request.query.skip;
      body.skip = skip;
    }

    if (ctx.request.query.limit) {
      const take: number = +ctx.request.query.limit;
      body.take = take;
    }

    const type = ctx.request.query.type;
    if (type === 'customerGroup') {
      where.customerGroupId = Not(IsNull());
    } else if (type === 'customer') {
      where.customerId = Not(IsNull());
    } else if (type === 'customerJobSite') {
      where.customerJobSiteId = Not(IsNull());
    } else if (type === 'serviceArea') {
      where.serviceAreaIds = Not([]);
    }

    const active: boolean = ctx.request.query.activeOnly === 'true';
    if (active) {
      where.active = true;
    }

    body.where = where;
    ctx.request.body = body;
    return super.getBy(ctx, next, PriceGroups);
  }

  async getPriceGroupBy(ctx: Context, next: Next) {
    return super.getBy(ctx, next, PriceGroups);
  }

  async addPriceGroup(ctx: Context, next: Next) {
    return super.insert(ctx, next, PriceGroups, PriceGroupsHistorical);
  }

  async updatePriceGroup(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    return super.update(ctx, next, PriceGroups, PriceGroupsHistorical, id);
  }

  async deletePriceGroup(ctx: Context, next: Next) {
    return super.delete(ctx, next, PriceGroups, PriceGroupsHistorical);
  }

  async duplicatePriceGroup(ctx: Context, next: Next) {
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const prices: Prices[] = await dataSource.manager.findBy(Prices, {
      priceGroupId: +ctx.url.split('/')[4],
    });
    const newPriceGroup: InsertResult = await dataSource.manager.insert(
      PriceGroups,
      ctx.request.body as QueryDeepPartialEntity<PriceGroups>,
    );
    const newPriceGroupID: number = newPriceGroup.identifiers.pop()?.id;
    const body = await dataSource.manager.findOneBy(PriceGroups, {
      id: newPriceGroupID,
    });
    if (!isEmpty(prices) && newPriceGroupID) {
      const pricesToInsert: Prices[] = [];
      prices.forEach(price => {
        price.priceGroupId = newPriceGroupID;
        pricesToInsert.push(price);
      });
      await dataSource.manager.insert(Prices, pricesToInsert);
    }
    await dataSource.destroy();
    ctx.body = body;
    ctx.status = 200;
    return next();
  }
}
