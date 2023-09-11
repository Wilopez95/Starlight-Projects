import camelCase from 'lodash/fp/camelCase.js';
import mapKeys from 'lodash/fp/mapKeys.js';
import uniqBy from 'lodash/uniqBy.js';
import ApiError from '../errors/ApiError.js';
import { BUSINESS_UNIT_TYPE } from '../consts/businessUnitTypes.js';
import VersionedRepository from './_versioned.js';
import BusinessUnitRepository from './businessUnit.js';
import OriginDistrictRepository from './originDistrict.js';
import OriginDistrictOriginPairRepository from './originDistrictOriginPair.js';

const TABLE_NAME = 'origins';
const OriginDistrictsTableName = OriginDistrictRepository.TABLE_NAME;
const OriginDistrictOriginPairTableName = OriginDistrictOriginPairRepository.TABLE_NAME;

const checkUniqDistricts = originDistricts => {
  const uniqDistricts = uniqBy(
    originDistricts,
    ({ county, state, city }) => `${county}${state}${city}`,
  );

  if (uniqDistricts.length < originDistricts.length) {
    throw ApiError.conflict(
      'Same districts for one origin',
      "Can't be saved. There are the same districts for one origin",
    );
  }
};

class OriginRepository extends VersionedRepository {
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

    return items?.map(item => this.mapFields(item, false)) ?? [];
  }

  async createOne({ data: { originDistricts, ...data }, log } = {}) {
    checkUniqDistricts(originDistricts);

    const trx = await this.knex.transaction();

    try {
      await this.checkBUType(data.businessUnitId, BUSINESS_UNIT_TYPE.recyclingFacility);

      const { id } = await super.createOne(
        {
          data,
          log: false,
        },
        trx,
      );

      if (originDistricts.length > 0) {
        await OriginDistrictRepository.getInstance(this.ctxState).insertManyForOrigin(
          id,
          originDistricts,
          trx,
        );
      }

      await trx.commit();

      const obj = await this.getById(id);

      log && this.log({ id: obj.id, action: this.logAction.create });

      return obj;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async getById(id, trx = this.knex) {
    const result = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        this.knex.raw(`
                        COALESCE(
                            jsonb_agg(row_to_json(${OriginDistrictsTableName}.*))
                            FILTER (WHERE ${OriginDistrictsTableName}.id IS NOT NULL),
                            '[]'
                        ) as "originDistricts"
                    `),
      ])
      .leftJoin(
        OriginDistrictOriginPairTableName,
        `${this.tableName}.id`,
        `${OriginDistrictOriginPairTableName}.originId`,
      )
      .leftJoin(
        OriginDistrictsTableName,
        `${OriginDistrictOriginPairTableName}.originDistrictId`,
        `${OriginDistrictsTableName}.id`,
      )
      .where(`${this.tableName}.id`, id)
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`)
      .first();

    if (result) {
      result.originDistricts = result.originDistricts?.map(item => mapKeys(camelCase)(item)) ?? [];
    }

    return result ?? ApiError.notFound();
  }

  async updateBy({ condition: { id }, data: { originDistricts, ...data }, log } = {}) {
    checkUniqDistricts(originDistricts);
    const OriginDistrictRepo = OriginDistrictRepository.getInstance(this.ctxState);

    const trx = await this.knex.transaction();

    try {
      await this.checkBUType(data.businessUnitId, BUSINESS_UNIT_TYPE.recyclingFacility);

      const { originDistricts: oldDistricts } = await this.getById(id);

      await OriginDistrictOriginPairRepository.getInstance(this.ctxState).deleteBy(
        {
          condition: {
            originId: id,
          },
        },
        trx,
      );

      if (originDistricts.length > 0) {
        await OriginDistrictRepository.getInstance(this.ctxState).insertManyForOrigin(
          id,
          originDistricts,
          trx,
        );
      }

      await OriginDistrictRepo.clearDistrictsWithoutOrigins(oldDistricts, trx);

      await super.updateBy(
        {
          condition: { id },
          data,
          log: false,
        },
        trx,
      );

      const result = await this.getById(id, trx);

      await trx.commit();

      log && this.log({ id: result.id, action: this.logAction.modify });

      return result;
    } catch (error) {
      await trx.rollback();

      throw error;
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getById(id, trx);

    return item || null;
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

OriginRepository.TABLE_NAME = TABLE_NAME;

export default OriginRepository;
