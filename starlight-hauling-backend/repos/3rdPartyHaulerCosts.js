import compose from 'lodash/fp/compose.js';
import pick from 'lodash/pick.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import MaterialRepo from './material.js';
import BillableServiceRepo from './billableService.js';

const TABLE_NAME = '3rd_party_hauler_costs';

class ThirdPartyHaulerCostsRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertOnConflict = `
            business_line_id,
            third_party_hauler_id,
            coalesce(billable_service_id, '-1'::integer),
            coalesce(material_id, '-2'::integer)
        `;

    this.upsertConstraints = [
      'thirdPartyHaulerId',
      'businessLineId',
      'billableServiceId',
      'materialId',
    ];
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
      if (item.cost === null) {
        itemsToRemove.push(pick(item, this.constraints));
        return false;
      }
      return true;
    }, this);

    const trx = await this.knex.transaction();

    try {
      if (data?.length) {
        await super.upsertMany(
          {
            data,
            concurrentData,
            constraints,
            log,
          },
          trx,
        );
      }

      if (itemsToRemove?.length) {
        await Promise.all(
          itemsToRemove.map(condition => this.deleteBy({ condition, log }, trx), this),
        );
      }

      await trx.commit();
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
          .concat(trx.raw('to_json(??.*) as ??', [MaterialRepo.TABLE_NAME, 'material']))
          .concat(
            trx.raw('to_json(??.*) as ??', [BillableServiceRepo.TABLE_NAME, 'billableService']),
          ),
      )
      .leftJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      )
      .leftJoin(
        BillableServiceRepo.TABLE_NAME,
        `${BillableServiceRepo.TABLE_NAME}.id`,
        `${this.tableName}.billableServiceId`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .groupBy([
        `${this.tableName}.id`,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${BillableServiceRepo.TABLE_NAME}.id`,
      ])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }
}

ThirdPartyHaulerCostsRepository.TABLE_NAME = TABLE_NAME;

export default ThirdPartyHaulerCostsRepository;
