import compose from 'lodash/fp/compose.js';
import pick from 'lodash/pick.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import MaterialRepo from './material.js';

const TABLE_NAME = 'disposal_site_rates';

class DisposalSiteRateRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_line_id,
            disposal_site_id,
            material_id
        `;
    this.upsertConstraints = ['disposalSiteId', 'businessLineId', 'materialId'];
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async upsertMany({ data: inputData, constraints, concurrentData, log }) {
    const itemsToRemove = [];
    const data = inputData.filter(item => {
      if (item.rate === null) {
        itemsToRemove.push(pick(item, this.constraints));
        return false;
      }
      return true;
    }, this);

    const trx = await this.knex.transaction();

    try {
      let itemsWithAction;
      if (data?.length) {
        const items = await super.upsertMany(
          {
            data,
            concurrentData,
            constraints,
            log: false,
          },
          trx,
        );

        if (log) {
          itemsWithAction = await Promise.all(
            items.map(async e => {
              const action = await this.getEntityActionBeforeUpsert(e, constraints);
              if (action) {
                e.__action = action;
              }
              return e;
            }, this),
          );
        }
      }

      if (itemsToRemove?.length) {
        await Promise.all(
          itemsToRemove.map(condition => this.deleteBy({ condition, log }, trx), this),
        );
      }
      await trx.commit();
      if (itemsWithAction?.length && log) {
        itemsWithAction.forEach(item => {
          const { __action: action, id } = item;
          action && this.log({ id, action });
          delete item.__action;
        }, this);
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async getAllPopulated({ condition = {}, fields = ['*'] }, trx = this.knex) {
    const items = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(
        fields
          .map(field => `${this.tableName}.${field}`)
          .concat(trx.raw('to_json(??.*) as ??', [MaterialRepo.TABLE_NAME, 'material'])),
      )
      .leftJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .groupBy([`${this.tableName}.id`, `${MaterialRepo.TABLE_NAME}.id`])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }
}

DisposalSiteRateRepository.TABLE_NAME = TABLE_NAME;

export default DisposalSiteRateRepository;
