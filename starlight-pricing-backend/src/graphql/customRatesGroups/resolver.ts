/* eslint-disable new-cap */
import { IsNull, Not } from 'typeorm';
import * as dateFnsTz from 'date-fns-tz';
import * as dateFns from 'date-fns';
import { AppDataSource } from '../../data-source';
import { CustomRatesGroups } from '../../database/entities/tenant/CustomRatesGroups';
import { ServiceAreasCustomRatesGroups } from '../../database/entities/tenant/ServiceAreasCustomRatesGroups';
import { ICustomRatesGroups, ICustomRatesGroupsResolver } from '../../Interfaces/CustomRatesGroups';
import { IServiceAreasCustomRatesGroup } from '../../Interfaces/ServiceAreasCustomRatesGroup';
import { IWhere } from '../../Interfaces/GeneralsFilter';

export const customRatesGroupsResolver = async (args: ICustomRatesGroupsResolver) => {
  const where: IWhere = {};
  const skip: number = args.skip ? args.skip : 0;

  if (args.id) {
    where.id = args.id;
  }
  if (args.businessLineId) {
    where.businessLineId = args.businessLineId;
  }
  if (args.businessUnitId) {
    where.businessUnitId = args.businessUnitId;
  }
  if (args.active) {
    where.active = args.active;
  }

  let query = AppDataSource.manager.getRepository(CustomRatesGroups).createQueryBuilder('crg');

  if (args.type) {
    switch (args.type) {
      case 'customerGroup':
        where.customerGroupId = Not(IsNull());
        break;
      case 'customer':
        where.customerId = Not(IsNull());
        break;
      case 'customerJobSite':
        where.customerJobSiteId = Not(IsNull());
        break;
      case 'serviceArea':
        if (args.serviceAreaIds) {
          const serviceAreaIds = args.serviceAreaIds;
          query = query.innerJoinAndMapMany(
            'crg.serviceAreaIds',
            ServiceAreasCustomRatesGroups,
            'sacrg',
            'sacrg.customRatesGroupId = crg.id AND sacrg.serviceAreaId IN(:...serviceAreaIds)',
            { serviceAreaIds },
          );
        } else {
          query = query.innerJoinAndMapMany(
            'crg.serviceAreaIds',
            ServiceAreasCustomRatesGroups,
            'sacrg',
            'sacrg.customRatesGroupId = crg.id',
          );
        }
        break;
      default:
        break;
    }
  }
  if (args.limit) {
    query = query.take(args.limit);
  }

  let dataDBResponse: ICustomRatesGroups[] | null = await query
    .where(where)
    .skip(skip)
    .orderBy('crg.id', 'DESC')
    .getMany();

  if (args.type === 'serviceArea') {
    dataDBResponse = dataDBResponse.filter(item => {
      if (!item.serviceAreaIds) return null;
      const serviceAreaIds = item.serviceAreaIds as IServiceAreasCustomRatesGroup[];
      item.serviceAreaIds = serviceAreaIds.map(x => x.serviceAreaId);
      return item;
    });
  }
  return dataDBResponse;
};

export const selectRatesGroupResolver = async (args: IWhere) => {
  const where: IWhere = {};
  let weekendDay: number = 0;

  if (args.businessLineId) {
    where.businessLineId = args.businessLineId;
  }
  if (args.businessUnitId) {
    where.businessUnitId = args.businessUnitId;
  }
  if (args.customerGroupId) {
    where.customerGroupId = args.customerGroupId;
  }
  if (args.customerJobSiteId) {
    where.customerJobSiteId = args.customerJobSiteId;
  }
  if (args.customerId) {
    where.customerId = args.customerId;
  }

  let query = AppDataSource.manager
    .getRepository(CustomRatesGroups)
    .createQueryBuilder('crg')
    .where(where);

  if (args.serviceAreaId) {
    query = query.innerJoinAndMapMany(
      'crg.serviceAreaId',
      ServiceAreasCustomRatesGroups,
      'sacrg',
      `sacrg.customRatesGroupId = crg.id AND sacrg.serviceAreaId = ${args.serviceAreaId}`,
    );
  }

  if (args.serviceDate) {
    const date = new Date(args.serviceDate as string);
    weekendDay = dateFns.getDay(dateFnsTz.zonedTimeToUtc(date, 'UTC'));
    query = query.andWhere(`${weekendDay} = ANY (crg.validDays)`);
  }

  let dataDBResponse: ICustomRatesGroups[] = await query.getMany();

  if (args.serviceAreaId) {
    dataDBResponse = dataDBResponse.map(item => {
      return { ...item, serviceAreaId: args.serviceAreaId };
    });
  }
  return dataDBResponse;
};
