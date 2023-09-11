import { DataSource } from 'typeorm';
import { Next } from 'koa';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { BaseController } from '../base.controller';
import { getJobSiteData } from '../../request/haulingRequest';
import {
  checkPriceGroups,
  createCustomRatesGroupsRepo,
  duplicateCustomRatesGroupsRepo,
  updateCustomRatesGroupsRepo,
} from '../../Repository/customRatesGroups/repository';
import httpStatus from '../../consts/httpStatusCodes';
import { Context } from '../../Interfaces/Auth';
import { IOrderBy } from '../../Interfaces/GeneralsFilter';
import { IGetCustomRatesGroupsData } from '../../Interfaces/CustomRatesGroups';
import { IGetJobSiteData, IGetJobSiteDataParams } from '../../Interfaces/JobSite';
import { CustomRatesGroups } from './../../database/entities/tenant/CustomRatesGroups';

export class CustomRatesGroupsController extends BaseController {
  async addCustomRatesGroups(ctx: Context, next: Next) {
    const data = ctx.request.body;
    if (data.serviceAreaIds?.length > 0 && data.spUsed) {
      await checkPriceGroups(ctx);
    }

    const dataResponse = await createCustomRatesGroupsRepo(ctx, next);
    ctx.status = httpStatus.CREATED;
    ctx.body = dataResponse;
    return next();
  }

  async updateCustomRatesGroups(ctx: Context, next: Next) {
    const id: number = +ctx.url.split('/')[4];
    return updateCustomRatesGroupsRepo(ctx, next, id);
  }

  async duplicateCustomRatesGroups(ctx: Context, next: Next) {
    const id = Number(ctx.params.id);
    if (!id) {
      ctx.status = httpStatus.BAD_REQUEST;
      return next();
    }
    return duplicateCustomRatesGroupsRepo(ctx, next, id);
  }

  async getCustomRatesGroups(ctx: Context, next: Next) {
    const { limit, skip, sortBy, sortOrder, customerJobSiteId, businessUnitId } = ctx.request.query;
    let paramLimit: number = 0;
    let paramSkip: number = 0;
    let paramSortBy: string = '';
    let paramSortOrder = 'DESC';
    const response: IGetCustomRatesGroupsData[] = [];
    if (limit) {
      paramLimit = +limit;
    }
    if (skip) {
      paramSkip = +skip;
    }
    if (sortBy) {
      if (sortBy === 'startDate') {
        paramSortBy = 'start_date';
      }
      if (sortBy === 'endDate') {
        paramSortBy = 'end_date';
      }
      if (sortBy === 'status') {
        paramSortBy = 'active';
      }
      if (sortBy === 'description') {
        paramSortBy = 'description';
      }
    }
    if (sortOrder) {
      paramSortOrder = sortOrder.toUpperCase();
    }
    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const customRatesGroup = await dataSource
      .createQueryBuilder()
      .select('')
      .from(CustomRatesGroups, 'customRates')
      .where(`customRates.customerJobSiteId = ${customerJobSiteId}`)
      .andWhere(`customRates.businessUnitId = ${businessUnitId}`)
      .limit(paramLimit)
      .skip(paramSkip)
      .orderBy(paramSortBy, paramSortOrder as IOrderBy)
      .getRawMany();

    for (let index = 0; index < customRatesGroup.length; index++) {
      const requestbody = {
        customerJobSiteId: customRatesGroup[index].customer_job_site_id,
      };
      const requestResponse = await getJobSiteData(ctx, { data: requestbody });
      const tmp: IGetCustomRatesGroupsData = {
        id: customRatesGroup[index].id,
        createdAt: customRatesGroup[index].created_at,
        updatedAt: customRatesGroup[index].updated_at,
        businessUnitId: customRatesGroup[index].business_unit_id,
        businessLineId: customRatesGroup[index].business_line_id,
        active: customRatesGroup[index].active,
        description: customRatesGroup[index].description,
        overweightSetting: customRatesGroup[index].overweight_setting,
        usageDaysSetting: customRatesGroup[index].usage_days_setting,
        demurrageSetting: customRatesGroup[index].demurrage_setting,
        customerGroupId: customRatesGroup[index].customer_group_id,
        customerId: customRatesGroup[index].customer_id,
        customerJobSiteId: customRatesGroup[index].customer_job_site_id,
        dumpSetting: customRatesGroup[index].dump_setting,
        loadSetting: customRatesGroup[index].load_setting,
        nonServiceHours: customRatesGroup[index].non_service_hours,
        spUsed: customRatesGroup[index].sp_used,
        validDays: customRatesGroup[index].valid_days,
        startDate: customRatesGroup[index].start_date,
        endDate: customRatesGroup[index].end_date,
        customerJobSite: requestResponse.customerJobSite,
        customer: requestResponse.customerJobSite.customer,
        jobSite: requestResponse.customerJobSite.jobSite,
      };
      response.push(tmp);
    }
    ctx.body = response;
    ctx.status = 200;
    await dataSource.destroy();
    return next();
  }

  async getCustomRatesGroupBy(ctx: Context, next: Next) {
    const { id } = ctx.params;

    const dataSource: DataSource = await BaseController.getDataSource(
      ctx.state.user.tenantName as string,
    );
    const customRatesGroup: QueryDeepPartialEntity<IGetCustomRatesGroupsData> | null =
      await dataSource
        .createQueryBuilder()
        .select('customRates')
        .from(CustomRatesGroups, 'customRates')
        .where(`customRates.id = ${id}`)
        .getOne();
    await dataSource.destroy();

    if (!customRatesGroup) {
      ctx.body = customRatesGroup;
      ctx.status = 200;
      return next();
    }

    const requestbody: IGetJobSiteDataParams = {
      customerJobSiteId: customRatesGroup.customerJobSiteId as number,
    };
    const requestResponse: IGetJobSiteData = await getJobSiteData(ctx, { data: requestbody });

    customRatesGroup.customerJobSite = requestResponse.customerJobSite;
    customRatesGroup.customer = requestResponse.customerJobSite.customer;
    customRatesGroup.jobSite = requestResponse.customerJobSite.jobSite;

    ctx.body = customRatesGroup;
    ctx.status = 200;
    return next();
  }
}
