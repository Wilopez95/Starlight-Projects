import { BUSINESS_UNIT_TYPE } from '../consts/businessUnitTypes.js';
import ApiError from '../errors/ApiError.js';
import VersionedRepository from './_versioned.js';
import BusinessUnitRepository from './businessUnit.js';

const TABLE_NAME = 'destinations';

class DestinationRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllPaginated({
    condition: { filters: { filterByBusinessUnits = [] } = {}, ...condition } = {},
    activeOnly,
    skip,
    limit,
    sortOrder,
    sortBy,
  } = {}) {
    if (activeOnly) {
      condition[`${this.tableName}.active`] = true;
    }

    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([`${this.tableName}.*`])
      .where(condition)
      .orderBy(sortBy ?? 'id', sortOrder);

    if (filterByBusinessUnits.length) {
      query = query.whereIn('businessUnitId', filterByBusinessUnits);
    }

    if (limit) {
      query = query.limit(limit).offset(skip);
    }

    const items = await query;

    return items ?? [];
  }

  async getAll({
    condition: { filters: { filterByBusinessUnits = [] } = {}, ...condition } = {},
    activeOnly,
    sortOrder,
    sortBy,
  } = {}) {
    if (activeOnly) {
      condition[`${this.tableName}.active`] = true;
    }

    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select([`${this.tableName}.*`])
      .where(condition)
      .orderBy(sortBy ?? 'id', sortOrder);

    if (filterByBusinessUnits.length) {
      query = query.whereIn('businessUnitId', filterByBusinessUnits);
    }

    const items = await query;

    return items ?? [];
  }

  async createOne({ data, log = true } = {}) {
    const trx = await this.knex.transaction();

    try {
      await this.checkBUType(data.businessUnitId, BUSINESS_UNIT_TYPE.recyclingFacility);

      const result = await super.createOne({ data, fields: ['*'], log }, trx);

      await trx.commit();

      return result;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async updateBy({ condition: { id }, data, log } = {}) {
    const trx = await this.knex.transaction();

    try {
      await this.checkBUType(data.businessUnitId, BUSINESS_UNIT_TYPE.recyclingFacility);

      const result = await super.updateBy(
        {
          data,
          fields: ['*'],
          condition: { id },
          log,
        },
        trx,
      );

      await trx.commit();

      return result;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async checkBUType(id, type) {
    const isRecyclingBU = await BusinessUnitRepository.getInstance(this.ctxState).exists({
      condition: {
        id,
        type,
      },
    });

    if (!isRecyclingBU) {
      throw ApiError.invalidRequest('Business Unit Type has to be `recyclingFacility`');
    }
  }
}

DestinationRepository.TABLE_NAME = TABLE_NAME;

export default DestinationRepository;
