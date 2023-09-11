import VersionedRepository from './_versioned.js';
import OriginDistrictOriginPairRepository from './originDistrictOriginPair.js';
import TaxDistrictRepository from './taxDistrict.js';

const OriginsManyToManyTable = OriginDistrictOriginPairRepository.TABLE_NAME;
const OriginsTableName = 'origins';

const TABLE_NAME = 'origin_districts';

class OriginDistrictRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getAllBy(
    {
      condition: {
        originDistricts = [],
        filters: { filterByBusinessUnits = [] } = {},
        activeOrigins,
      } = {},
      sortOrder,
      sortBy,
      fields = ['*'],
    } = {},
    trx = this.knex,
  ) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .orderBy(sortBy ?? 'id', sortOrder);

    originDistricts.forEach(originDistrict => {
      query = query.orWhere(originDistrict);
    });

    if (filterByBusinessUnits.length || activeOrigins) {
      query = query.whereExists(builder => {
        let q = builder
          .select(`${OriginsManyToManyTable}.*`)
          .withSchema(this.schemaName)
          .from(OriginsManyToManyTable)
          .innerJoin(
            OriginsTableName,
            `${OriginsTableName}.id`,
            `${OriginsManyToManyTable}.originId`,
          )
          .where(
            `${OriginsManyToManyTable}.origin_district_id`,
            '=',
            trx.ref(`${this.tableName}.id`),
          );

        if (filterByBusinessUnits.length) {
          q = q.whereIn(`${OriginsTableName}.business_unit_id`, filterByBusinessUnits);
        }

        if (activeOrigins) {
          q = q.andWhere(`${OriginsTableName}.active`, true);
        }

        return q;
      });
    }

    const res = await query;

    return res || [];
  }

  async getTaxDistrictByOriginDistrict({ condition: { id } } = {}, trx = this.knex) {
    const result = await TaxDistrictRepository.getInstance(this.ctxState).getBy(
      {
        condition: {
          active: true,
          id: trx(this.tableName).withSchema(this.schemaName).select('taxDistrictId').where({ id }),
        },
      },
      trx,
    );

    return result?.[0];
  }

  async insertManyForOrigin(originId, originDistricts, trx) {
    const _trx = trx || (await this.knex.transaction());
    const OriginDistrictOriginsPairRepo = OriginDistrictOriginPairRepository.getInstance(
      this.ctxState,
    );

    try {
      const existedDistricts = await this.getAllBy({
        condition: {
          originDistricts,
        },
      });

      const createdDistricts = await this.insertMany(
        {
          data: originDistricts.filter(district =>
            existedDistricts?.every(
              ({ city, state, county }) =>
                `${city}${state}${county}` !==
                `${district.city}${district.state}${district.county}`,
            ),
          ),
          fields: ['*'],
        },
        trx,
      );

      await OriginDistrictOriginsPairRepo.insertMany(
        {
          data: [...createdDistricts, ...existedDistricts].map(({ id: originDistrictId }) => ({
            originId,
            originDistrictId,
          })),
        },
        trx,
      );

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  async clearDistrictsWithoutOrigins(districtsToCheck, trx) {
    const _trx = trx || (await this.knex.transaction());

    try {
      await _trx(this.tableName)
        .withSchema(this.schemaName)
        .whereNotExists(builder => {
          builder
            .select(`${OriginsManyToManyTable}.*`)
            .withSchema(this.schemaName)
            .from(OriginsManyToManyTable)
            .where(
              `${OriginsManyToManyTable}.origin_district_id`,
              '=',
              _trx.ref(`${this.tableName}.id`),
            );
        })
        .delete();

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }

      throw error;
    }
  }

  getWithOrigin(id, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .select([`${this.tableName}.*`, `${OriginsTableName}.description as description`])
      .where(`${this.tableName}.id`, id)
      .innerJoin(
        OriginsManyToManyTable,
        `${OriginsManyToManyTable}.origin_district_id`,
        `${this.tableName}.id`,
      )
      .innerJoin(OriginsTableName, `${OriginsManyToManyTable}.origin_id`, `${OriginsTableName}.id`)
      .first();
  }
}

OriginDistrictRepository.TABLE_NAME = TABLE_NAME;

export default OriginDistrictRepository;
