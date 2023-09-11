import compose from 'lodash/fp/compose.js';
import pick from 'lodash/pick.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import MaterialRepo from './material.js';
import BillableLineItemRepo from './billableLineItem.js';
import DisposalSiteRepo from './disposalSite.js';

const TABLE_NAME = 'material_codes';

class MaterialCodeRepository extends VersionedRepository {
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
      if (item.recyclingMaterialCode === null && item.billableLineItemId === null) {
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
          .concat(
            trx.raw('to_json(??.*) as ??', [MaterialRepo.TABLE_NAME, 'material']),
            trx.raw('to_json(??.*) as ??', [BillableLineItemRepo.TABLE_NAME, 'billableLineItem']),
          ),
      )
      .leftJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      )
      .leftJoin(
        BillableLineItemRepo.TABLE_NAME,
        `${this.tableName}.billableLineItemId`,
        `${BillableLineItemRepo.TABLE_NAME}.id`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .groupBy([
        `${this.tableName}.id`,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${BillableLineItemRepo.TABLE_NAME}.id`,
      ])
      .orderBy(`${this.tableName}.id`);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getByWithMaterial({ condition, fields = ['*'] }, trx = this.knex) {
    const item = await this.knex(this.tableName)
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
      .orderBy(`${this.tableName}.id`)
      .first();

    return item ? this.mapFields(item) : null;
  }

  getAllByCodes({ condition, codes }, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('recyclingMaterialCode', codes)
      .andWhere(condition)
      .select(['recyclingMaterialCode', 'billableLineItemId', 'materialId']);
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];

    ({ query, selects } = await super.populateBl({ query, selects }));

    let jtName = DisposalSiteRepo.TABLE_NAME;
    let joinedTableColumns = await DisposalSiteRepo.getColumnsToSelect({
      alias: 'disposalSite',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.disposalSiteId`);

    jtName = BillableLineItemRepo.TABLE_NAME;
    joinedTableColumns = await BillableLineItemRepo.getColumnsToSelect({
      alias: 'billableLineItem',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.billableLineItemId`);

    jtName = MaterialRepo.TABLE_NAME;
    joinedTableColumns = await MaterialRepo.getColumnsToSelect({
      alias: 'material',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.materialId`);

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, this.mapFields)(item) : null;
  }
}

MaterialCodeRepository.TABLE_NAME = TABLE_NAME;

export default MaterialCodeRepository;
