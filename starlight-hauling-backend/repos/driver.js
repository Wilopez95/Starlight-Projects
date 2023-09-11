import { startOfDay } from 'date-fns';
import compose from 'lodash/fp/compose.js';

import xor from 'lodash/xor.js';
import ApiError from '../errors/ApiError.js';
import { fromGeoToJson } from '../utils/postgis.js';
import * as publishers from '../services/routePlanner/publishers.js';
import VersionedRepository from './_versioned.js';
import TruckBusinessUnit from './truckBusinessUnitPair.js';
import DriverBusinessUnit from './driverBusinessUnitPair.js';
import BusinessUnitRepository from './businessUnit.js';

const TABLE_NAME = 'drivers';
const businessUnitTableName = BusinessUnitRepository.TABLE_NAME;
const driverBusinessUnitTableName = DriverBusinessUnit.TABLE_NAME;
const truckTableName = 'trucks';
const businessUnitNamesKey = 'business_unit_names';
const truckDescriptionKey = 'truckDescription';

const truckIsNotInSameBU =
  'pages.SystemConfiguration.tables.Truck.QuickView.ServerErrors.TruckIsNotInSameBU';

class DriverRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllPaginated({
    condition: { ids = [], filters = {}, query: searchQuery, email, ...condition } = {},
    activeOnly,
    skip,
    limit,
    sortOrder,
    sortBy,
  } = {}) {
    if (activeOnly) {
      condition[`${this.tableName}.active`] = true;
    }
    if (email) {
      condition[`${this.tableName}.email`] = email;
    }
    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        this.knex.raw(`array_agg(json_build_object(
          'name', ${businessUnitTableName}.name_line_1,
          'id', ${businessUnitTableName}.id
        )) as "businessUnits"`),
        this.knex.raw(`string_agg(
          ${businessUnitTableName}.name_line_1, ', '
          order by ${businessUnitTableName}.name_line_1
        ) as ${businessUnitNamesKey}`),
        this.knex.raw(`json_build_object(
          'id', ${truckTableName}.id,
          'description', ${truckTableName}.description,
          'location', ${fromGeoToJson(this.knex, `${truckTableName}.location`)}
        ) as "truck"`),
      ])
      .leftJoin(truckTableName, `${this.tableName}.truck_id`, `${truckTableName}.id`)
      .leftJoin(
        driverBusinessUnitTableName,
        `${driverBusinessUnitTableName}.driver_id`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        businessUnitTableName,
        `${driverBusinessUnitTableName}.business_unit_id`,
        `${businessUnitTableName}.id`,
      )
      .groupBy(`${this.tableName}.id`, `${truckTableName}.id`)
      .where(condition);

    if (ids?.length) {
      query = query.whereIn(`${this.tableName}.id`, ids);
    }

    const performSearch = `${searchQuery ?? ''}`?.length > 2;
    if (performSearch) {
      query = query.andWhere(builder => {
        builder.orWhere(`${this.tableName}.description`, 'ilike', `%${searchQuery}%`);
        builder.orWhere(`${this.tableName}.phone`, 'ilike', `%${searchQuery}%`);
      });
    }

    const { filterByBusinessUnit, filterByTruck } = filters;
    if (filterByBusinessUnit) {
      query = query.havingRaw(`
        array_agg(${businessUnitTableName}.id)
        &&
        array[${filterByBusinessUnit.join(',')}]
      `);
    }
    if (filterByTruck) {
      query = query.andWhere({
        [`${truckTableName}.id`]: filterByTruck,
      });
    }

    let orderBy = `${sortBy ?? 'id'}`;
    if (sortBy === truckDescriptionKey) {
      orderBy = `${truckTableName}.description`;
    }
    if (sortBy === businessUnitNamesKey) {
      orderBy = `"${businessUnitNamesKey}"`;
    }

    query = query.orderBy(orderBy, sortOrder);

    if (limit) {
      query = query.limit(limit).offset(skip);
    }

    const items = await query;

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async getById({ id }, trx = this.knex) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw(`array_agg(${businessUnitTableName}.id) as "businessUnitIds"`),
        trx.raw(`json_build_object(
          'id', ${truckTableName}.id,
          'description', ${truckTableName}.description,
          'location', ${fromGeoToJson(this.knex, `${truckTableName}.location`)}
        ) as "truck"`),
      ])
      .leftJoin(
        driverBusinessUnitTableName,
        `${this.tableName}.id`,
        `${driverBusinessUnitTableName}.driverId`,
      )
      .leftJoin(
        businessUnitTableName,
        `${driverBusinessUnitTableName}.businessUnitId`,
        `${businessUnitTableName}.id`,
      )
      .leftJoin(truckTableName, `${this.tableName}.truck_id`, `${truckTableName}.id`)
      .where(`${this.tableName}.id`, id)
      .groupBy(`${this.tableName}.id`, `${truckTableName}.id`)
      .orderBy(`${this.tableName}.id`)
      .first();

    return result ?? ApiError.notFound();
  }

  async createOne(
    {
      data: { businessUnitIds, truckId, licenseValidityDate, medicalCardValidityDate, ...body },
      log,
    },
    trx,
  ) {
    const _trx = trx || (await this.knex.transaction());

    try {
      // todo check that new truck is active and included in BU list
      const truckHasSameBU = await this.truckHasSameBU(truckId, businessUnitIds);
      if (!truckHasSameBU) {
        throw ApiError.invalidRequest(truckIsNotInSameBU);
      }

      this.checkDateValidity(licenseValidityDate);
      this.checkDateValidity(medicalCardValidityDate);

      const driver = await super.createOne(
        {
          data: {
            ...body,
            truckId,
            licenseValidityDate,
            medicalCardValidityDate,
          },
        },
        _trx,
      );

      const { id: driverId } = driver;

      await DriverBusinessUnit.getInstance(this.ctxState).insertMany(
        {
          data: businessUnitIds.map(businessUnitId => ({
            businessUnitId,
            driverId,
          })),
        },
        _trx,
      );

      const result = await this.getById({ id: driverId }, _trx);

      if (!trx) {
        await _trx.commit();
      }

      log && this.log({ id: driverId, action: this.logAction.create });
      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  async updateOne({ data, id, log }, trx) {
    const { businessUnitIds, truckId, licenseValidityDate, medicalCardValidityDate, ...body } =
      data;
    const _trx = trx || (await this.knex.transaction());

    try {
      const {
        businessUnitIds: storedBUIds,
        truckId: storedTruckId,
        active: storedActive,
      } = await this.getById({ id }, _trx);

      const wereBUChanged = xor(storedBUIds, businessUnitIds).length > 0;
      const wasActiveChanged = storedActive !== body.active;
      if (wereBUChanged || storedTruckId !== truckId) {
        const truckHasSameBU = await this.truckHasSameBU(truckId, businessUnitIds);
        if (!truckHasSameBU) {
          throw ApiError.invalidRequest(truckIsNotInSameBU);
        }
      }
      if (wereBUChanged) {
        await DriverBusinessUnit.getInstance(this.ctxState).deleteBy(
          {
            condition: {
              driverId: id,
            },
          },
          _trx,
        );
        await DriverBusinessUnit.getInstance(this.ctxState).insertMany(
          {
            data: businessUnitIds.map(businessUnitId => ({
              businessUnitId,
              driverId: id,
            })),
          },
          _trx,
        );
      }

      await this.updateBy(
        {
          condition: { id },
          data: {
            ...body,
            truckId,
            licenseValidityDate,
            medicalCardValidityDate,
          },
          log: false,
        },
        _trx,
      );

      this.checkDateValidity(licenseValidityDate);
      this.checkDateValidity(medicalCardValidityDate);

      const result = await this.getById({ id }, _trx);
      log && this.log({ id, action: this.logAction.modify });

      if (wasActiveChanged) {
        publishers.upsertDriver(this.getCtx(), result);
      }

      if (!trx) {
        await _trx.commit();
      }

      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  checkDateValidity(date) {
    if (startOfDay(date) < startOfDay(new Date())) {
      throw ApiError.invalidRequest('Invalid Date');
    }
  }

  async truckHasSameBU(truckId, businessUnitIds) {
    const truckBUPairs = await TruckBusinessUnit.getInstance(this.ctxState).getAll({
      condition: {
        truckId,
      },
    });

    return (
      truckBUPairs?.some(({ businessUnitId }) => businessUnitIds.includes(businessUnitId)) ?? false
    );
  }

  driversRelatedToTruckCount(truckId, activeOnly = true) {
    const condition = {
      truckId,
    };
    if (activeOnly) {
      condition.active = true;
    }
    return this.count({
      condition,
    });
  }

  async getByIdToLog(id, trx = this.knex) {
    const driver = await this.getById({ id }, trx);

    return driver ? compose(super.mapFields, super.camelCaseKeys)(driver) : null;
  }
}

DriverRepository.TABLE_NAME = TABLE_NAME;

export default DriverRepository;
