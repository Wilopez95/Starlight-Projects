import difference from 'lodash/difference.js';
import map from 'lodash/map.js';
import omit from 'lodash/omit.js';
import isEmpty from 'lodash/isEmpty.js';
import compose from 'lodash/fp/compose.js';

import { AUDIT_LOG_ENTITY } from '../consts/auditLog.js';
import { unambiguousSelect } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import BillableLineItemMaterialRepo from './billableLineItemMaterial.js';
import BillableLineItemBillingCycleRepo from './billableLineItemBillingCycle.js';
import MaterialRepository from './material.js';
import BusinessLineRepo from './businessLine.js';

const TABLE_NAME = 'billable_line_items';
const FIELDS_TO_LOG = ['id', 'active', 'description'];

class BillableLineItemRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessLineId', 'description'];
  }

  async createOneTime({ data, log }, trx) {
    let newBillableLineItem;

    const _trx = trx ?? (await this.knex.transaction());

    try {
      newBillableLineItem = await super.createOne({ data: omit(data, 'materialIds') }, _trx);

      const mappedIds = data.materialIds?.map(materialId => ({
        billableLineItemId: newBillableLineItem.id,
        materialId,
      }));

      if (mappedIds?.length) {
        await BillableLineItemMaterialRepo.getInstance(this.ctxState).insertMany(
          { data: mappedIds },
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

    log && this.log({ id: newBillableLineItem.id, action: this.logAction.create });

    return newBillableLineItem;
  }

  async createRecurrent({ data, billingCycles, log, fields = ['*'] } = {}) {
    const trx = await this.knex.transaction();
    let newLineItem;
    try {
      newLineItem = await super.createOne({ data, fields }, trx);

      const { id: billableLineItemId } = newLineItem;
      newLineItem.billingCycles = [];

      if (billingCycles?.length) {
        const billingCyclesRepo = BillableLineItemBillingCycleRepo.getInstance(this.ctxState);

        await billingCyclesRepo.insertMany(
          {
            billingCycles,
            billableLineItemId,
          },
          trx,
        );

        const billingCyclesData = await billingCyclesRepo.getAll(
          {
            condition: { billableLineItemId },
            fields: ['billingCycle'],
          },
          trx,
        );

        newLineItem.billingCycles = billingCyclesData?.map(
          billingCycleData => billingCycleData.billingCycle,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log &&
      this.log({
        id: newLineItem.id,
        entity: AUDIT_LOG_ENTITY.billable_recurring_line_items,
        action: this.logAction.create,
      });

    return newLineItem;
  }

  async updateOneTime({ condition: { id }, concurrentData, data, log }) {
    let updatedLineItem;
    const trx = await this.knex.transaction();

    try {
      const billableLineItemMaterialRepo = BillableLineItemMaterialRepo.getInstance(this.ctxState);

      const materials = await billableLineItemMaterialRepo.getAll(
        {
          condition: { billableLineItemId: id },
        },
        trx,
      );

      updatedLineItem = await super.updateBy(
        {
          condition: { id },
          concurrentData,
          data: omit(data, 'materialIds'),
        },
        trx,
      );

      const newMaterialIds = data?.materialIds || [];
      const allMaterialIds = map(materials, 'materialId');
      const addedMaterials = difference(newMaterialIds, allMaterialIds);
      const removedMaterials = difference(allMaterialIds, newMaterialIds);

      if (!isEmpty(addedMaterials)) {
        await billableLineItemMaterialRepo.insertMany(
          {
            data: addedMaterials.map(materialId => ({
              materialId,
              billableLineItemId: id,
            })),
          },
          trx,
        );
      }
      if (!isEmpty(removedMaterials)) {
        await billableLineItemMaterialRepo.deleteByLineItemIdAndMaterialIds(
          { data: { billableLineItemId: id, materialIds: removedMaterials } },
          trx,
        );
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });

    return updatedLineItem;
  }

  async updateBillingCycles(
    { billableLineItemId, billingCycles, fields = ['*'] },
    trx = this.knex,
  ) {
    const billingCyclesRepo = BillableLineItemBillingCycleRepo.getInstance(this.ctxState);

    const oldBillingCyclesData = await billingCyclesRepo.getAll(
      {
        condition: { billableLineItemId },
        fields: ['billingCycle'],
      },
      trx,
    );

    const oldBillingCycles = oldBillingCyclesData?.map(({ billingCycle }) => billingCycle) ?? [];

    const add = difference(billingCycles, oldBillingCycles);
    const remove = difference(oldBillingCycles, billingCycles);

    if (add?.length) {
      await billingCyclesRepo.insertMany({ billableLineItemId, billingCycles: add }, trx);
    }

    if (remove?.length) {
      await billingCyclesRepo.deleteByIds({ billableLineItemId, billingCycles: remove }, trx);
    }

    const updatedBillingCycles = await billingCyclesRepo.getAll(
      { condition: { billableLineItemId }, fields },
      trx,
    );

    return updatedBillingCycles || [];
  }

  async updateRecurrent({
    condition,
    concurrentData,
    data,
    fields = ['*'],
    billingCycles = [],
    log,
  }) {
    const trx = await this.knex.transaction();

    let updatedLineItem;
    try {
      const updatedBillingCycles = await this.updateBillingCycles(
        { billableLineItemId: condition.id, billingCycles, fields: ['billingCycle'] },
        trx,
      );

      updatedLineItem = await super.updateBy(
        {
          condition,
          concurrentData,
          data,
          fields,
        },
        trx,
      );

      updatedLineItem.billingCycles = updatedBillingCycles?.map(cycle => cycle.billingCycle) ?? [];

      await trx.commit();

      log &&
        this.log({
          id: updatedLineItem.id,
          entity: AUDIT_LOG_ENTITY.billable_recurring_line_items,
          action: this.logAction.modify,
        });
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return updatedLineItem;
  }

  async getAllWithIncludes(
    { condition = {}, fields = ['*'], nestedFields = ['*'], orderBy = ['id'] },
    trx = this.knex,
  ) {
    const BillingCycleJoinedTableName = 'blbc';
    const MaterialJoinedTableName = 'materials';

    const { billingCycle, businessLineIds, ...whereCondition } = condition;

    const selects = [
      ...fields.map(field => `${this.tableName}.${field}`),
      ...nestedFields.map(field => `${BillingCycleJoinedTableName}.${field}`),
      `${MaterialJoinedTableName}.materialIds`,
    ];

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(selects)
      .where(whereCondition)
      .orderBy(orderBy)
      .leftJoin(
        trx(BillableLineItemMaterialRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select([
            `${BillableLineItemMaterialRepo.TABLE_NAME}.billableLineItemId`,
            trx.raw(`nullif(array_agg(??.??), '{NULL}') as ??`, [
              BillableLineItemMaterialRepo.TABLE_NAME,
              'materialId',
              'materialIds',
            ]),
          ])
          .groupBy(`${BillableLineItemMaterialRepo.TABLE_NAME}.billableLineItemId`)
          .as(MaterialJoinedTableName),
        `${MaterialJoinedTableName}.billableLineItemId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        trx(BillableLineItemBillingCycleRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select([
            `${BillableLineItemBillingCycleRepo.TABLE_NAME}.billableLineItemId`,
            trx.raw(`nullif(array_agg(??.??), '{NULL}') as ??`, [
              BillableLineItemBillingCycleRepo.TABLE_NAME,
              'billingCycle',
              'billingCycles',
            ]),
          ])
          .groupBy(`${BillableLineItemBillingCycleRepo.TABLE_NAME}.billableLineItemId`)
          .as(BillingCycleJoinedTableName),
        `${BillingCycleJoinedTableName}.billableLineItemId`,
        `${this.tableName}.id`,
      );

    if (billingCycle) {
      query = query.whereRaw('? = ANY(??)', [
        billingCycle,
        `${BillingCycleJoinedTableName}.billingCycles`,
      ]);
    }
    if (businessLineIds) {
      query = query.whereIn('businessLineId', businessLineIds);
    }

    const result = await query;

    return result;
  }

  async deleteBy({ condition = {}, conditionNot = {}, log } = {}) {
    const { id: billableLineItemId } = condition;

    const trx = await this.knex.transaction();
    try {
      if (billableLineItemId) {
        await BillableLineItemBillingCycleRepo.getInstance(this.ctxState).deleteBy(
          { condition: { billableLineItemId } },
          trx,
        );
      }

      let query = trx(this.tableName).withSchema(this.schemaName).select(['id']);

      if (!isEmpty(condition)) {
        query = query.where(condition);
      }

      if (!isEmpty(conditionNot)) {
        Object.entries(conditionNot).forEach(([key, value]) => {
          query = query.andWhereRaw('??.?? is distinct from ?', [this.tableName, key, value]);
        });

        const restOfBlItems = await query;
        if (restOfBlItems?.length) {
          await super.deleteByIds({ ids: map(restOfBlItems, 'id') }, trx);
        }
      } else if (!isEmpty(condition)) {
        await super.deleteBy({ condition }, trx);
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    const { id } = condition;
    log && id && this.log({ id, action: this.logAction.delete });
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    const selects = unambiguousSelect(this.tableName, FIELDS_TO_LOG);
    await super.populateBl({ query, selects });

    selects.push(trx.raw('json_agg(??.*) as ??', [MaterialRepository.TABLE_NAME, 'materials']));
    query = query
      .leftJoin(
        BillableLineItemMaterialRepo.TABLE_NAME,
        `${BillableLineItemMaterialRepo.TABLE_NAME}.billableLineItemId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        MaterialRepository.TABLE_NAME,
        `${BillableLineItemMaterialRepo.TABLE_NAME}.materialId`,
        `${MaterialRepository.TABLE_NAME}.id`,
      )
      .groupBy([`${this.tableName}.id`, `${BusinessLineRepo.TABLE_NAME}.id`])
      .orderBy(`${this.tableName}.id`);

    const item = await query.select(selects);
    if (!item) {
      return null;
    }

    const billingCyclesRepo = BillableLineItemBillingCycleRepo.getInstance(this.ctxState);

    const billingCycles = await billingCyclesRepo.getBillingCyclesByLineItemId(
      {
        condition: { billableLineItemId: id },
        fields: ['billingCycle'],
      },
      trx,
    );

    item.billingCycles = billingCycles;

    return item
      ? compose(super.mapNestedObjects.bind(this, []), super.mapJoinedFields, this.mapFields)(item)
      : null;
  }

  getByIds({ condition = {}, ids = [], fields = ['*'] }, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('id', ids)
      .andWhere(condition)
      .select(fields);
  }
}

BillableLineItemRepository.TABLE_NAME = TABLE_NAME;

export default BillableLineItemRepository;
