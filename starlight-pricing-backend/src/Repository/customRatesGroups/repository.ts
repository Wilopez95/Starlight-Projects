import { Next } from 'koa';
import * as _ from 'lodash';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { isEmpty } from 'lodash';
import { FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { CustomRatesGroups } from '../../database/entities/tenant/CustomRatesGroups';
import {
  ICheckPriceGroupsBody,
  ICustomRatesGroups,
  ICustomRatesGroupsRepo,
  TypeMapDuplicatedItemsWithBULoB,
} from '../../Interfaces/CustomRatesGroups';
import ApiError from '../../utils/ApiError';
import { CustomRatesGroupsHistorical } from '../../database/entities/tenant/CustomRatesGroupsHistorical';
import { ServiceAreasCustomRatesGroups } from '../../database/entities/tenant/ServiceAreasCustomRatesGroups';
import { CustomRatesGroupServices } from '../../database/entities/tenant/CustomRatesGroupServices';
import { CustomRatesGroupLineItems } from '../../database/entities/tenant/CustomRatesGroupLineItems';
import { CustomRatesGroupThresholds } from '../../database/entities/tenant/CustomRatesGroupThresholds';
import { CustomRatesGroupSurcharges } from '../../database/entities/tenant/CustomRatesGroupSurcharges';
import httpStatus from '../../consts/httpStatusCodes';
import { upsertManyCustomRatesGroupSurcharges } from '../customRatesGroupSurcharges/repository';
import { upsertManyCustomRatesGroupThresholds } from '../customRatesGroupThresholds/repository';
import { upsertManyCustomRatesGroupServices } from '../customRatesGroupServices/repository';
import { upsertManyCustomRatesGroupLineItems } from '../customRatesGroupLineItems/repository';
import { Context } from '../../Interfaces/Auth';
import { IWhere } from '../../Interfaces/GeneralsFilter';

const updateHistorical = (data: CustomRatesGroups, id: number) => {
  return AppDataSource.manager.insert(CustomRatesGroupsHistorical, {
    ...data,
    originalId: id,
    eventType: 'created',
    userId: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    traceId: 'trace_id',
  });
};

export const checkPriceGroups = async (ctx: Context, currentPriceGroupId?: number | undefined) => {
  const { businessUnitId, businessLineId, serviceAreaIds } = ctx.request
    .body as ICheckPriceGroupsBody;
  const existingSpPriceGroups: ICustomRatesGroups[] = await AppDataSource.manager
    .getRepository(CustomRatesGroups)
    .createQueryBuilder('crg')
    .where({
      businessUnitId,
      businessLineId,
      spUsed: true,
    })
    .innerJoinAndMapMany(
      'crg.serviceAreaIds',
      'service_areas_custom_rates_groups',
      'sacrg',
      'sacrg.customRatesGroupId = crg.id AND sacrg.serviceAreaId IN(:...serviceAreaIds)',
      { serviceAreaIds },
    )
    .take(0)
    .skip(0)
    .getMany();
  if (existingSpPriceGroups.length >= 1) {
    const exists = existingSpPriceGroups
      .filter((item: ICustomRatesGroups) => String(item.id) !== String(currentPriceGroupId))
      .some(item => _.intersection(serviceAreaIds, item.serviceAreaIds as number[]).length > 0);
    if (exists) {
      throw ApiError.invalidRequest(
        'Only one Price Group can be marked for SP usage for specific Service Area',
        '',
      );
    }
  }
};

const mapDuplicatedItemsWithBULoB = (
  items: TypeMapDuplicatedItemsWithBULoB,
  input: ICustomRatesGroups,
) =>
  items.map(i => ({
    ...i,
    businessUnitId: input.businessUnitId,
    businessLineId: input.businessLineId,
  }));

export const createCustomRatesGroupsRepo = async (ctx: Context, _next: Next) => {
  const data: ICustomRatesGroupsRepo = ctx.request.body;
  if (!isEmpty(data.serviceAreaIds) && data.spUsed) {
    await checkPriceGroups(ctx);
  }

  const createCustomRatesGroups = await AppDataSource.manager.insert(CustomRatesGroups, data);
  await updateHistorical(data, createCustomRatesGroups.identifiers.pop()?.id as number);

  if (!isEmpty(data.serviceAreaIds) && data.id) {
    const addedServiceAreaIds = data.serviceAreaIds.map((serviceAreaId: number) => ({
      serviceAreaId,
      customRatesGroupId: data.id,
      createdAt: new Date(),
      updatedAt: null,
    }));

    await AppDataSource.manager
      .createQueryBuilder()
      .insert()
      .into(ServiceAreasCustomRatesGroups)
      .values(addedServiceAreaIds as QueryDeepPartialEntity<ServiceAreasCustomRatesGroups>)
      .execute();
  }
  return createCustomRatesGroups.generatedMaps[0];
};

export const updateCustomRatesGroupsRepo = async (ctx: Context, next: Next, id: number) => {
  const data = ctx.request.body;
  data.customerGroupId = data.customerGroupId || null;
  data.customerId = data.customerId || null;
  data.customerJobSiteId = data.customerJobSiteId || null;

  const { serviceAreaIds, ...newCtx } = data;

  await AppDataSource.manager.update(CustomRatesGroups, { id }, {
    ...newCtx,
    updatedAt: new Date(),
  } as QueryDeepPartialEntity<CustomRatesGroups>);
  const dataGet = await AppDataSource.manager.findOneBy(CustomRatesGroups, {
    id,
  });
  const historical: QueryDeepPartialEntity<CustomRatesGroupsHistorical> = {
    ...data,
    originalId: id,
    eventType: 'edited',
    userId: 'system',
    createdAt: new Date(),
    updatedAt: new Date(),
    traceId: 'trace_id',
  };
  await AppDataSource.manager.insert(CustomRatesGroupsHistorical, historical);

  if (id && serviceAreaIds?.length > 0) {
    await AppDataSource.manager.delete(ServiceAreasCustomRatesGroups, {
      customRatesGroupId: id,
    });
    const addedServiceAreaIds = serviceAreaIds.map((serviceAreaId: number[]) => ({
      serviceAreaId,
      customRatesGroupId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await AppDataSource.manager
      .createQueryBuilder()
      .insert()
      .into(ServiceAreasCustomRatesGroups)
      .values(addedServiceAreaIds as QueryDeepPartialEntity<ServiceAreasCustomRatesGroups>)
      .execute();
  }
  ctx.body = { ...dataGet, serviceAreaIds };
  ctx.status = httpStatus.OK;

  return next();
};

export const duplicateCustomRatesGroupsRepo = async (ctx: Context, next: Next, _id: number) => {
  const customRatesGroupId = Number(ctx.params.id);
  const data: ICustomRatesGroups = ctx.request.body;
  const dataBase = AppDataSource.manager;

  const newCustomRatesGroup = await createCustomRatesGroupsRepo(ctx, next);

  const where: IWhere = { customRatesGroupId };

  const [serviceRates, lineItemRates, thresholdRates, surchargeRates] = await Promise.all([
    dataBase.findBy(CustomRatesGroupServices, where as FindOptionsWhere<CustomRatesGroupServices>),
    dataBase.findBy(
      CustomRatesGroupLineItems,
      where as FindOptionsWhere<CustomRatesGroupLineItems>,
    ),
    dataBase.findBy(
      CustomRatesGroupThresholds,
      where as FindOptionsWhere<CustomRatesGroupThresholds>,
    ),
    dataBase.findBy(
      CustomRatesGroupSurcharges,
      where as FindOptionsWhere<CustomRatesGroupSurcharges>,
    ),
  ]);

  where.customRatesGroupId = newCustomRatesGroup.id;
  where.businessUnitId = data.businessUnitId;
  where.businessLineId = data.businessLineId;
  await Promise.all([
    serviceRates.length
      ? upsertManyCustomRatesGroupServices({
          where,
          serviceRatesData: mapDuplicatedItemsWithBULoB(serviceRates, data),
          duplicate: true,
          ctx,
        })
      : Promise.resolve(),
    lineItemRates.length
      ? upsertManyCustomRatesGroupLineItems({
          where,
          oldData: mapDuplicatedItemsWithBULoB(lineItemRates, data),
          ctx,
        })
      : Promise.resolve(),
    thresholdRates.length
      ? upsertManyCustomRatesGroupThresholds({
          where,
          oldData: mapDuplicatedItemsWithBULoB(thresholdRates, data),
        })
      : Promise.resolve(),
    surchargeRates.length
      ? upsertManyCustomRatesGroupSurcharges({
          where,
          oldData: mapDuplicatedItemsWithBULoB(surchargeRates, data),
        })
      : Promise.resolve(),
  ]);

  ctx.status = httpStatus.CREATED;
  ctx.body = newCustomRatesGroup;
};
