import compose from 'lodash/fp/compose.js';

import ApiError from '../errors/ApiError.js';
import { fromGeoToJsonAs, toGeoJson } from '../utils/postgis.js';
import * as publishers from '../services/routePlanner/publishers.js';
import VersionedRepository from './_versioned.js';
import BusinessUnitRepository from './businessUnit.js';
import BusinessLineRepository from './businessLine.js';
import TruckBusinessUnit from './truckBusinessUnitPair.js';
import TruckTypeBusinessLinePair from './truckTypeBusinessLinePair.js';
import DriverRepository from './driver.js';

const TABLE_NAME = 'trucks';
const businessUnitNamesKey = 'business_unit_names';
const truckTypeDescriptionKey = 'truckTypeDescription';
const businessUnitTableName = BusinessUnitRepository.TABLE_NAME;
const businessLineTableName = BusinessLineRepository.TABLE_NAME;
const truckTypeTableName = 'truck_types';
const truckBusinessUnitPairTableName = TruckBusinessUnit.TABLE_NAME;
const truckTypeBusinessLinePairTableName = TruckTypeBusinessLinePair.TABLE_NAME;
const licenseError = 'pages.SystemConfiguration.tables.Truck.QuickView.ServerErrors.LicenseError';
const deactivateError =
  'pages.SystemConfiguration.tables.Truck.QuickView.ServerErrors.DeactivateError';
const FIELDS_TO_LOG = ['id', 'active', 'note', 'licensePlate', 'description'];

class TruckRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllPaginated({
    condition: { ids = [], filters = {}, query: searchQuery, ...condition } = {},
    activeOnly,
    skip,
    limit,
    sortOrder,
    sortBy,
  } = {}) {
    if (activeOnly) {
      condition[`${this.tableName}.active`] = true;
    }

    const selects = [
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
        'id', ${truckTypeTableName}.id,
        'description', ${truckTypeTableName}.description
      ) as "truckType"`),
      fromGeoToJsonAs(this.knex, 'location'),
    ];

    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(truckTypeTableName, `${this.tableName}.truck_type_id`, `${truckTypeTableName}.id`)
      .leftJoin(
        truckBusinessUnitPairTableName,
        `${truckBusinessUnitPairTableName}.truck_id`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        businessUnitTableName,
        `${truckBusinessUnitPairTableName}.business_unit_id`,
        `${businessUnitTableName}.id`,
      )
      .groupBy(`${this.tableName}.id`, `${truckTypeTableName}.id`)
      .where(condition);

    if (ids?.length) {
      query = query.whereIn(`${this.tableName}.id`, ids);
    }

    const performSearch = `${searchQuery ?? ''}`?.length > 2;
    if (performSearch) {
      query = query.andWhere(builder => {
        builder.orWhere(`${this.tableName}.description`, 'ilike', `%${searchQuery}%`);
        builder.orWhere(`${this.tableName}.licensePlate`, 'ilike', `%${searchQuery}%`);
      });
    }

    const { filterByBusinessUnit, filterByTruckType, filterByBusinessLine } = filters;
    if (filterByTruckType) {
      query = query.whereIn(`${truckTypeTableName}.id`, filterByTruckType);
    }
    if (filterByBusinessUnit) {
      query = query.havingRaw(`
        array_agg(${businessUnitTableName}.id)
        &&
        array[${filterByBusinessUnit.join(',')}]
      `);
    }

    if (filterByBusinessLine) {
      selects.push(
        this.knex.raw(`array_agg(json_build_object(
          'type', ${businessLineTableName}.type,
          'id', ${businessLineTableName}.id
        )) as "businessLines"`),
      );

      query = query
        .leftJoin(
          truckTypeBusinessLinePairTableName,
          `${this.tableName}.truck_type_id`,
          `${truckTypeBusinessLinePairTableName}.truck_type_id`,
        )
        .leftJoin(
          businessLineTableName,
          `${truckTypeBusinessLinePairTableName}.business_line_id`,
          `${businessLineTableName}.id`,
        )
        .groupBy(
          `${truckTypeBusinessLinePairTableName}.truck_type_id`,
          `${businessLineTableName}.type`,
        ).havingRaw(`
          array_agg(${truckTypeBusinessLinePairTableName}.business_line_id)
          &&
          array[${filterByBusinessLine.join(',')}]
        `);
    }

    const orderBy =
      sortBy === truckTypeDescriptionKey
        ? `${truckTypeTableName}.description`
        : `${sortBy ?? 'id'}`;
    query = query.orderBy(orderBy, sortOrder);

    if (limit) {
      query = query.limit(limit).offset(skip);
    }

    const items = await query.select(selects);

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async createOne({ data: { businessUnitIds, active, licensePlate, ...body }, log }, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      await this.checkUniqueLicensePlate(active, licensePlate);

      const truck = await super.createOne(
        {
          data: {
            ...body,
            active,
            licensePlate,
          },
        },
        _trx,
      );

      const { id: truckId } = truck;

      // create relations with BU
      await TruckBusinessUnit.getInstance(this.ctxState).insertMany(
        {
          data: businessUnitIds.map(businessUnitId => ({
            businessUnitId,
            truckId,
          })),
        },
        _trx,
      );

      const result = await this.getById({ id: truckId }, _trx);

      if (!trx) {
        await _trx.commit();
      }

      log && this.log({ id: result.id, action: this.logAction.create });

      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  async getById({ id }, trx = this.knex) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw(`json_build_object(
          'id', ${truckTypeTableName}.id,
          'description', ${truckTypeTableName}.description
        ) as "truckType"`),
        trx.raw(`array_agg(json_build_object(
          'name', ${businessUnitTableName}.name_line_1,
          'id', ${businessUnitTableName}.id
        )) as "businessUnits"`),
        fromGeoToJsonAs(trx, 'location'),
      ])
      .leftJoin(truckTypeTableName, `${this.tableName}.truckTypeId`, `${truckTypeTableName}.id`)
      .leftJoin(
        truckBusinessUnitPairTableName,
        `${this.tableName}.id`,
        `${truckBusinessUnitPairTableName}.truckId`,
      )
      .leftJoin(
        businessUnitTableName,
        `${truckBusinessUnitPairTableName}.businessUnitId`,
        `${businessUnitTableName}.id`,
      )
      .where(`${this.tableName}.id`, id)
      .groupBy(`${this.tableName}.id`, `${truckTypeTableName}.id`)
      .orderBy(`${this.tableName}.id`)
      .first();

    return result ?? ApiError.notFound();
  }

  async updateOne({ data, id, log }, trx) {
    const { active, businessUnitIds, licensePlate, ...body } = data;
    const _trx = trx || (await this.knex.transaction());

    try {
      if (!active) {
        const activeDriversCount = await DriverRepository.getInstance(
          this.ctxState,
        ).driversRelatedToTruckCount(id);

        if (activeDriversCount > 0) {
          throw ApiError.invalidRequest(deactivateError);
        }
      }

      const { licensePlate: originalLicensePlate, active: storedActive } = await this.getById(
        { id },
        _trx,
      );
      const wasActiveChanged = storedActive !== body.active;

      if (originalLicensePlate !== licensePlate) {
        await this.checkUniqueLicensePlate(active, licensePlate);
      }

      // delete old relations with BU
      await TruckBusinessUnit.getInstance(this.ctxState).deleteBy(
        {
          condition: {
            truckId: id,
          },
        },
        _trx,
      );

      // create new relations
      await TruckBusinessUnit.getInstance(this.ctxState).insertMany(
        {
          data: businessUnitIds.map(businessUnitId => ({
            businessUnitId,
            truckId: id,
          })),
        },
        _trx,
      );

      await this.updateBy(
        {
          condition: { id },
          data: {
            ...body,
            active,
            licensePlate,
          },
          log: false,
        },
        _trx,
      );

      const result = await this.getById({ id }, _trx);
      if (wasActiveChanged) {
        publishers.upsertTruck(this.getCtx(), result);
      }

      if (!trx) {
        await _trx.commit();
      }

      log && this.log({ id, action: this.logAction.modify });

      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  async checkUniqueLicensePlate(isActive, licensePlate) {
    // `licensePlate` should be unique for active trucks
    if (isActive) {
      const isLicensePlateUnique = await this.getBy({
        condition: { licensePlate, active: true },
      });

      if (isLicensePlateUnique) {
        throw ApiError.invalidRequest(licenseError);
      }
    }
  }

  trucksRelatedToTruckTypesCount(truckTypeId, activeOnly = true) {
    const condition = {
      truckTypeId,
    };
    if (activeOnly) {
      condition.active = true;
    }
    return this.count({
      condition,
    });
  }

  async updateLocation(id, location) {
    await this.updateBy({
      condition: { id },
      data: { location: toGeoJson(this.knex, location) },
    });
    const result = await this.getById({ id });
    return result;
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        ...FIELDS_TO_LOG.map(field => `${this.tableName}.${field}`),
        trx.raw(`json_build_object(
          'id', ${truckTypeTableName}.id,
          'description', ${truckTypeTableName}.description
        ) as "truckType"`),
        trx.raw(`array_agg(json_build_object(
          'name', ${businessUnitTableName}.name_line_1,
          'id', ${businessUnitTableName}.id
        )) as "businessUnits"`),
      ])
      .innerJoin(truckTypeTableName, `${this.tableName}.truckTypeId`, `${truckTypeTableName}.id`)
      .leftJoin(
        truckBusinessUnitPairTableName,
        `${this.tableName}.id`,
        `${truckBusinessUnitPairTableName}.truckId`,
      )
      .leftJoin(
        businessUnitTableName,
        `${truckBusinessUnitPairTableName}.businessUnitId`,
        `${businessUnitTableName}.id`,
      )
      .where(`${this.tableName}.id`, id)
      .groupBy(`${this.tableName}.id`, `${truckTypeTableName}.id`)
      .first();

    return item
      ? compose(super.mapNestedObjects.bind(this, []), super.mapFields, super.camelCaseKeys)(item)
      : null;
  }
}

TruckRepository.TABLE_NAME = TABLE_NAME;

export default TruckRepository;
