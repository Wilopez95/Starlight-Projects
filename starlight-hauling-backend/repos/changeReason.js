import compose from 'lodash/fp/compose.js';

import { camelCaseKeys, mapAddressFields, unambiguousSelect } from '../utils/dbHelpers.js';
import { ITEMS_PER_PAGE } from '../consts/limits.js';
import { CHANGE_REASON_SORTING_ATTRIBUTE } from '../consts/changeReasonSortingAttributes.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import ChangeReasonBusinessLinePairRepo from './changeReasonBusinessLinePair.js';
import BusinessLineRepo from './businessLine.js';
import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'change_reasons';
const businessLineNamesKey = 'businessLineNames';
const businessLineTableName = BusinessLineRepo.TABLE_NAME;

class ChangeReasonRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      obj => {
        if (obj.businessLines?.[0] == null) {
          obj.businessLines = [];
        }

        return obj;
      },
      mapAddressFields,
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async getAllPaginated(
    {
      condition = {},
      activeOnly,
      sortBy = CHANGE_REASON_SORTING_ATTRIBUTE.description,
      sortOrder = SORT_ORDER.asc,
      skip = 0,
      limit = ITEMS_PER_PAGE,
      fields = ['*'],
    },
    trx = this.knex,
  ) {
    if (activeOnly) {
      condition[`${this.tableName}.active`] = true;
    }

    const orderBy =
      sortBy === businessLineNamesKey
        ? `"${businessLineNamesKey}"`
        : `${this.tableName}.${sortBy ?? 'id'}`;

    const query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        ...unambiguousSelect(this.tableName, fields),
        trx.raw(`array_agg(json_build_object(
          'name', ${businessLineTableName}.name,
          'id', ${businessLineTableName}.id
        )) as "businessLines"`),
        trx.raw(`string_agg(
                  ${businessLineTableName}.name, ', ' order by ${businessLineTableName}.name
              ) as "${businessLineNamesKey}"`),
      ])
      .innerJoin(
        ChangeReasonBusinessLinePairRepo.TABLE_NAME,
        `${ChangeReasonBusinessLinePairRepo.TABLE_NAME}.changeReasonId`,
        `${this.tableName}.id`,
      )
      .innerJoin(
        BusinessLineRepo.TABLE_NAME,
        `${BusinessLineRepo.TABLE_NAME}.id`,
        `${ChangeReasonBusinessLinePairRepo.TABLE_NAME}.businessLineId`,
      )
      .where(condition)
      .groupBy([`${this.tableName}.id`])
      .orderByRaw(`${orderBy} ${sortOrder}`);

    const items = await query.limit(limit).offset(skip);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async createOne({ data: { businessLineIds, ...data }, fields = ['*'], log } = {}, trx) {
    const _trx = trx || (await this.knex.transaction());

    let changeReason = {};
    try {
      changeReason = await super.createOne({ data, fields }, _trx);

      const changeReasonBusinessLinesData = businessLineIds?.map(businessLineId => ({
        changeReasonId: changeReason.id,
        businessLineId,
      }));

      if (changeReasonBusinessLinesData?.length >= 1) {
        await ChangeReasonBusinessLinePairRepo.getInstance(this.ctxState).insertMany(
          { data: changeReasonBusinessLinesData },
          _trx,
        );
      }

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    log &&
      this.log({
        id: changeReason.id,
        entity: this.tableName,
        action: this.logAction.create,
      });

    return changeReason;
  }

  async updateOne({ id, data: { businessLineIds, ...data }, fields = ['*'], log } = {}) {
    const trx = await this.knex.transaction();

    let changeReason = {};
    try {
      changeReason = await super.updateBy({ condition: { id }, data, fields }, trx);

      const poBusinessLinesData = businessLineIds?.map(businessLineId => ({
        changeReasonId: changeReason.id,
        businessLineId,
      }));

      if (poBusinessLinesData?.length >= 1) {
        await ChangeReasonBusinessLinePairRepo.getInstance(this.ctxState).deleteBy(
          {
            condition: {
              changeReasonId: changeReason.id,
            },
          },
          trx,
        );
        await ChangeReasonBusinessLinePairRepo.getInstance(this.ctxState).insertMany(
          { data: poBusinessLinesData },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log &&
      this.log({
        id: changeReason.id,
        entity: this.tableName,
        action: this.logAction.updateOne,
      });

    return changeReason;
  }
}

ChangeReasonRepository.TABLE_NAME = TABLE_NAME;

export default ChangeReasonRepository;
