import compose from 'lodash/fp/compose.js';
import differenceWith from 'lodash/differenceWith.js';
import difference from 'lodash/difference.js';
import toNumber from 'lodash/toNumber.js';
import map from 'lodash/map.js';

import {
  camelCaseKeys,
  unambiguousCondition,
  unambiguousSelect,
  unambiguousSelectSlots,
} from '../utils/dbHelpers.js';
import { ACTION } from '../consts/actions.js';
import { AUDIT_LOG_ENTITY } from '../consts/auditLog.js';
import VersionedRepository from './_versioned.js';
import EquipmentItemRepo from './equipmentItem.js';
import MaterialEquipmentItemRepo from './materialEquipmentItem.js';
import MaterialRepo from './material.js';

import BillableServiceFrequencyRepo from './billableServiceFrequency.js';
import BillableServiceInclusionRepo from './billableServiceInclusion.js';
import BillableServiceBillingCycleRepo from './billableServiceBillingCycle.js';
import FrequencyRepo from './frequency.js';

const frequencyCheck = (a, b) => {
  let result = a.type === b.type;
  if (result && a.times && b.times) {
    result = a.times === b.times;
  }
  return result;
};

const TABLE_NAME = 'billable_services';

class BillableServiceRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessLineId', 'description'];
  }

  mapFields(originalObj, { skipNested } = {}) {
    const equipmentItemRepo = EquipmentItemRepo.getInstance(this.ctxState);
    return compose(
      obj => {
        if (!skipNested) {
          if (obj.includedServices?.[0]) {
            obj.includedServices = obj.includedServices.filter(Boolean);
          }
          if (obj.equipmentItem?.[0] || obj.equipmentItem) {
            obj.equipmentItem = equipmentItemRepo.mapFields(
              obj.equipmentItem?.[0] ?? obj.equipmentItem,
            );
          }
        }
        return obj;
      },
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOneTime(...args) {
    return await super.createOne(...args);
  }

  async createRecurrent({ data, frequencies, services, billingCycles, concurrentData, log }) {
    const trx = await this.knex.transaction();

    let newService;
    try {
      newService = await super.createOne(
        {
          data,
          concurrentData,
        },
        trx,
      );

      const { id: billableServiceId } = newService;

      if (frequencies?.length) {
        const addFrequencyIds = await FrequencyRepo.getInstance(this.ctxState).getByFrequencyData(
          { condition: { frequencies } },
          trx,
        );

        await BillableServiceFrequencyRepo.getInstance(this.ctxState).insertMany(
          {
            data: addFrequencyIds.map(frequency => ({
              billableServiceId,
              frequencyId: frequency.id,
            })),
          },
          trx,
        );
      } else if (newService.action === ACTION.rental) {
        await BillableServiceFrequencyRepo.getInstance(this.ctxState).createOne(
          { data: { billableServiceId, frequencyId: null } },
          trx,
        );
      }

      if (services?.length) {
        const includedSrcsRepo = BillableServiceInclusionRepo.getInstance(this.ctxState);

        await includedSrcsRepo.insertMany(
          {
            includedServiceIds: services,
            billableServiceId,
          },
          trx,
        );

        const includedServicesData = await includedSrcsRepo.getIncludedServicesByServiceId(
          { billableServiceId },
          trx,
        );

        newService.services = includedServicesData.services;
      }

      if (billingCycles?.length) {
        const billingCyclesRepo = BillableServiceBillingCycleRepo.getInstance(this.ctxState);

        await billingCyclesRepo.insertMany(
          {
            billingCycles,
            billableServiceId,
          },
          trx,
        );

        const billingCyclesData = await billingCyclesRepo.getBillingCyclesByServiceId(
          { billableServiceId },
          trx,
        );

        newService.billingCycles = billingCyclesData.billingCycles;
      }

      await trx.commit();

      log &&
        this.log({
          id: billableServiceId,
          action: this.logAction.create,
          entity: AUDIT_LOG_ENTITY.billable_recurring_services,
        });
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return newService;
  }

  async populateWithEquipmentItem(
    { condition: { id }, fields = ['*'], nestedFields = [] } = {},
    trx = this.knex,
  ) {
    const selects = [
      ...fields.map(field => `${this.tableName}.${field}`, this),
      ...nestedFields.map(field => `${EquipmentItemRepo.TABLE_NAME}.${field}`),
    ];

    const whereClause = this.tableName.includes('historical')
      ? `${this.tableName}.originalId`
      : `${this.tableName}.id`;

    try {
      const item = await trx(this.tableName)
        .withSchema(this.schemaName)
        .select(selects)
        .leftJoin(
          EquipmentItemRepo.TABLE_NAME,
          `${EquipmentItemRepo.TABLE_NAME}.id`,
          `${this.tableName}.equipmentItemId`,
        )
        .where(whereClause, id)
        .first();

      return item ? this.mapFields(item) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getAllWithIncludes({ condition = {}, fields = ['*'], orderBy = ['id'] }, trx = this.knex) {
    const {
      populateIncluded: shouldPopulate,
      frequencyIds,
      equipmentItemIds,
      billingCycle,
      includeNotService,
      businessLineIds,
      ...whereCondition
    } = condition;

    const BillingCycleJoinedTable = 'bsbc';
    const IncludedServicesJoinedTable = 'bsis';

    const selects = [
      ...fields.map(field => `${this.tableName}.${field}`),
      `${IncludedServicesJoinedTable}.services`,
      `${BillingCycleJoinedTable}.billingCycles`,
    ];

    const billingCycleAggregatedTable = BillableServiceBillingCycleRepo.getInstance(
      this.ctxState,
    ).getAggregatedBillingCyclesTable({ joinAs: BillingCycleJoinedTable, billingCycle }, trx);

    const includedServicesAggregatedTable = BillableServiceInclusionRepo.getInstance(
      this.ctxState,
    ).getAggregatedIncludedServicesTable(
      { joinAs: IncludedServicesJoinedTable, shouldPopulate },
      trx,
    );

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(whereCondition)
      .orderBy(orderBy)
      .leftJoin(
        billingCycleAggregatedTable,
        `${BillingCycleJoinedTable}.billableServiceId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        includedServicesAggregatedTable,
        `${IncludedServicesJoinedTable}.billableServiceId`,
        `${this.tableName}.id`,
      );

    if (!includeNotService) {
      query = query.whereNot(`${this.tableName}.action`, ACTION.notService);
    }

    if (businessLineIds) {
      query = query.whereIn('businessLineId', businessLineIds);
    }

    if (equipmentItemIds) {
      query = query.whereIn('equipmentItemId', equipmentItemIds);
    }

    if (frequencyIds?.length) {
      const targetTable = BillableServiceFrequencyRepo.TABLE_NAME;
      selects.push(`${targetTable}.frequencyId`);

      query = query.innerJoin(
        BillableServiceFrequencyRepo.TABLE_NAME,
        `${targetTable}.billableServiceId`,
        `${this.tableName}.id`,
      );

      query = query.where(builder => {
        let hasNull = false;
        builder.whereIn(
          'frequencyId',
          frequencyIds.filter(el => {
            if (el) {
              return true;
            }
            hasNull = true;
            return false;
          }),
        );

        if (hasNull) {
          builder.orWhere('frequencyId', null);
        }
      });
    }
    if (billingCycle) {
      query.where(q => {
        q.where(`bsbc.billing_cycles`, [billingCycle]).orWhere(`${this.tableName}.one_time`, true);
      });
    }
    return await query.select(selects);
  }

  async updateOneTime(...args) {
    return await super.updateBy(...args);
  }

  async updateBillingCycles({ billableServiceId, billingCycles }, trx = this.knex) {
    const billingCyclesRepo = BillableServiceBillingCycleRepo.getInstance(this.ctxState);

    const oldBillingCyclesData = await billingCyclesRepo.getAll(
      { condition: { billableServiceId } },
      trx,
    );

    const oldBillingCycles = oldBillingCyclesData ? map(oldBillingCyclesData, 'billingCycle') : [];

    const add = difference(billingCycles, oldBillingCycles);
    const remove = difference(oldBillingCycles, billingCycles);

    if (add?.length) {
      await billingCyclesRepo.insertMany({ billableServiceId, billingCycles: add }, trx);
    }

    if (remove?.length) {
      await billingCyclesRepo.deleteBillingCyclesByServiceId(
        { billableServiceId, billingCycles: remove },
        trx,
      );
    }

    const updatedBillingCycles = await billingCyclesRepo.getBillingCyclesByServiceId(
      { billableServiceId },
      trx,
    );

    return updatedBillingCycles || {};
  }

  async updateIncludedServices({ billableServiceId, includedServices }, trx = this.knex) {
    const includedServicesRepo = BillableServiceInclusionRepo.getInstance(this.ctxState);

    const oldIncludedServicesData = await includedServicesRepo.getAll(
      { condition: { billableServiceId } },
      trx,
    );

    const oldIncludedServices = oldIncludedServicesData
      ? map(oldIncludedServicesData, 'includedServiceId')
      : [];

    const newIncludedServices = map(includedServices, toNumber);

    const add = difference(newIncludedServices, oldIncludedServices);
    const remove = difference(oldIncludedServices, newIncludedServices);

    if (add?.length) {
      await includedServicesRepo.insertMany({ billableServiceId, includedServiceIds: add }, trx);
    }

    if (remove?.length) {
      await includedServicesRepo.deleteIncludedServicesByServiceId(
        { billableServiceId, includedServiceIds: remove },
        trx,
      );
    }

    const updatedIncludedServices = await includedServicesRepo.getIncludedServicesByServiceId(
      { billableServiceId },
      trx,
    );

    return updatedIncludedServices || {};
  }

  async updateRecurrent({
    condition: { id },
    data,
    frequencies: newFrequencies = [],
    billingCycles: newBillingCycles = [],
    services: newIncludedServices = [],
    concurrentData,
    log,
  } = {}) {
    const bsFrqRepo = BillableServiceFrequencyRepo.getInstance(this.ctxState);
    const frequencyRepo = FrequencyRepo.getInstance(this.ctxState);

    const trx = await this.knex.transaction();

    let updatedService;
    try {
      const oldService = await super.getById({ id, fields: ['action'] }, trx);
      const oldAction = oldService?.action;

      updatedService = await super.updateBy(
        {
          condition: { id },
          data,
          concurrentData,
          log: false,
        },
        trx,
      );

      const oldFrequencies = await bsFrqRepo.getAll({ condition: { billableServiceId: id } }, trx);

      let oldFrequenciesData = [];
      if (oldFrequencies) {
        oldFrequenciesData = await frequencyRepo.getAllByIds(
          {
            condition: { ids: map(oldFrequencies, 'frequencyId') },
          },
          trx,
        );
      }

      const add = differenceWith(newFrequencies, oldFrequenciesData, frequencyCheck);
      const remove = differenceWith(oldFrequenciesData, newFrequencies, frequencyCheck);

      if (add?.length) {
        const addFrequencyIds = await frequencyRepo.getByFrequencyData(
          {
            condition: { frequencies: add },
          },
          trx,
        );

        await bsFrqRepo.insertMany(
          {
            data: addFrequencyIds.map(frequency => ({
              billableServiceId: id,
              frequencyId: frequency.id,
            })),
          },
          trx,
        );
      }

      if (remove?.length) {
        const removeFrequencyIds = await frequencyRepo.getByFrequencyData(
          { condition: { frequencies: remove } },
          trx,
        );

        await bsFrqRepo.deleteByIds(
          {
            condition: {
              billableServiceId: id,
              frequencyIds: map(removeFrequencyIds, 'id'),
            },
          },
          trx,
        );
      }

      if (oldAction !== updatedService.action) {
        if (updatedService.action === ACTION.rental) {
          await bsFrqRepo.upsert(
            {
              data: {
                billableServiceId: updatedService.id,
                frequencyId: null,
              },
            },
            trx,
          );
        } else {
          await bsFrqRepo.deleteBy(
            {
              condition: {
                billableServiceId: id,
                frequencyId: null,
              },
            },
            trx,
          );
        }
      }

      const [billingCycleData, servicesData] = await Promise.all([
        this.updateBillingCycles(
          {
            billableServiceId: id,
            billingCycles: newBillingCycles,
          },
          trx,
        ),
        this.updateIncludedServices(
          {
            billableServiceId: id,
            includedServices: newIncludedServices || [],
          },
          trx,
        ),
      ]);

      updatedService.billingCycles = billingCycleData.billingCycles;
      updatedService.services = servicesData.services;

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log &&
      this.log({
        id,
        action: this.logAction.modify,
        entity: AUDIT_LOG_ENTITY.billable_recurring_services,
      });

    return updatedService;
  }

  async deleteBy({ condition = {}, fields = ['*'], log } = {}) {
    const { id: billableServiceId } = condition;

    const trx = await this.knex.transaction();
    try {
      if (billableServiceId) {
        await Promise.all([
          BillableServiceBillingCycleRepo.getInstance(this.ctxState).deleteBy(
            { condition: { billableServiceId } },
            trx,
          ),
          BillableServiceInclusionRepo.getInstance(this.ctxState),
        ]);
      }

      await super.deleteBy({ condition, fields }, trx);

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: billableServiceId, action: this.logAction.delete });
  }

  async populateWithAllowedMaterials(
    { condition: { materialId, ...condition } = {} },
    trx = this.knex,
  ) {
    const whereCondition = unambiguousCondition(this.tableName, condition);
    if (materialId) {
      whereCondition[`${MaterialRepo.TABLE_NAME}.id`] = materialId;
    }
    if (condition.active) {
      whereCondition[`${EquipmentItemRepo.TABLE_NAME}.active`] = true;
      whereCondition[`${MaterialRepo.TABLE_NAME}.active`] = true;
    }

    const items = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select([
        `${this.tableName}.*`,
        trx.raw('json_agg(??.*) as ??', [MaterialRepo.TABLE_NAME, 'allowedMaterials']),
        trx.raw('to_json(??.*) as ??', [EquipmentItemRepo.TABLE_NAME, 'equipmentItem']),
      ])
      .where(whereCondition)
      .innerJoin(
        EquipmentItemRepo.TABLE_NAME,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${this.tableName}.equipmentItemId`,
      )
      .innerJoin(
        MaterialEquipmentItemRepo.TABLE_NAME,
        `${EquipmentItemRepo.TABLE_NAME}.id`,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.equipmentItemId`,
      )
      .innerJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${MaterialEquipmentItemRepo.TABLE_NAME}.materialId`,
      )
      .groupBy([`${this.tableName}.id`, `${EquipmentItemRepo.TABLE_NAME}.id`])
      .orderBy(`${this.tableName}.id`);

    return items?.map(item => {
      if (item?.allowedMaterials?.length) {
        item.allowedMaterials = item.allowedMaterials.map(camelCaseKeys);
      }
      if (item?.equipmentItem) {
        item.equipmentItem = camelCaseKeys(item.equipmentItem);
      }
      return item;
    });
  }

  getAll(params = {}, trx = this.knex) {
    const { condition, hideWithActions } = params;
    const query = super.getAll(
      Object.assign(params, { condition: unambiguousCondition(this.tableName, condition) }),
      trx,
    );

    if (hideWithActions?.length) {
      query.whereNotIn('action', hideWithActions);
    }

    return query;
  }

  // pre-pricing service refactor code:
  // async getByHistoricalId({ id, condition, fields = ['*'] }, trx = this.knex) {
  //   const item = await trx(this.historicalTableName)
  //     .withSchema(this.schemaName)
  //     .innerJoin(this.tableName, `${this.tableName}.id`, `${this.historicalTableName}.originalId`)
  //     .where(`${this.historicalTableName}.id`, id)
  //     .andWhere(unambiguousCondition(this.tableName, condition))
  //     .select(fields.map(i => `${this.tableName}.${i}`))
  //     .first();
  //   return item;
  // }

  async getAllByHistoricalIds({ condition = {}, ids = [], fields = ['*'] } = {}, trx = this.knex) {
    const items = await super.getAllByHistoricalIds({ condition, ids, fields }, trx);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  /**
   * Get BillableService for ids specified - include billableServiceIncludeServices and equipment
   * @param condition
   * @param ids
   * @param fields
   * @param trx
   * @returns {Promise<*>}
   */
  async getAllWithIncludedByHistoricalIds(
    { condition = {}, ids = [], fields = ['*'] },
    trx = this.knex,
  ) {
    const inclusionTable = BillableServiceInclusionRepo.TABLE_NAME;
    const equipmentTable = EquipmentItemRepo.TABLE_NAME;

    const includedServicesFields = fields.filter(field => !field.includes('.'));
    const includedServicesSelectsSlots = unambiguousSelectSlots('ibs', includedServicesFields).map(
      (slot, idx) => `'${includedServicesFields[idx]}', ${slot}`,
    );

    includedServicesSelectsSlots.push(`'historicalId', ibsh.id`);

    const selects = [
      ...unambiguousSelect(this.tableName, fields),
      trx.raw(
        `json_agg(json_strip_nulls(json_build_object(${includedServicesSelectsSlots.join(
          ', ',
        )}))) as ??`,
        [...includedServicesFields, 'includedServices'],
      ),
      trx.raw('to_json(??.*) as ??', [equipmentTable, 'equipmentItem']),
    ];

    const query = trx(this.historicalTableName)
      .withSchema(this.schemaName)
      .innerJoin(this.tableName, `${this.tableName}.id`, `${this.historicalTableName}.originalId`)
      .innerJoin(equipmentTable, `${equipmentTable}.id`, `${this.tableName}.equipmentItemId`)
      .leftJoin(inclusionTable, `${inclusionTable}.billableServiceId`, `${this.tableName}.id`)
      .leftJoin(`"${this.tableName}" as ibs`, `ibs.id`, `${inclusionTable}.includedServiceId`)
      .leftJoin(`"${this.historicalTableName}" as ibsh`, `ibsh.originalId`, `ibs.id`)
      .whereIn(`${this.historicalTableName}.id`, ids)
      .andWhere(unambiguousCondition(this.tableName, condition))
      .groupBy([`${this.historicalTableName}.id`, `${this.tableName}.id`, `${equipmentTable}.id`])
      .select(selects);

    const items = await query;

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  getBillingCyclesByIds({ billableServiceIds }, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .leftJoin(
        `billable_service_billing_cycles`,
        `${this.tableName}.id`,
        `billable_service_billing_cycles.billable_service_id`,
      )
      .whereIn('billable_services.id', billableServiceIds)
      .select(
        'billable_services.id',
        trx.raw(`array_agg(??.??) as ??`, [
          'billable_service_billing_cycles',
          'billingCycle',
          'billingCycles',
        ]),
      )
      .groupBy(`billable_services.id`);
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];
    ({ query, selects } = await super.populateBl({ query, selects }));

    const jtName = EquipmentItemRepo.TABLE_NAME;
    const joinedTableColumns = await EquipmentItemRepo.getColumnsToSelect({
      alias: 'equipmentItem',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    const billingCyclesRepo = BillableServiceBillingCycleRepo.getInstance(this.ctxState);
    const billingCycles = await billingCyclesRepo.getAll(
      { condition: { billableServiceId: id } },
      trx,
    );

    const includedServicesRepo = BillableServiceInclusionRepo.getInstance(this.ctxState);
    const inclServices = await includedServicesRepo.getIncludedServicesByServiceId(
      { billableServiceId: id },
      trx,
    );

    const bsFrqRepo = BillableServiceFrequencyRepo.getInstance(this.ctxState);
    const bsFrequencies = await bsFrqRepo.getAll({ condition: { billableServiceId: id } }, trx);

    const frequencyRepo = FrequencyRepo.getInstance(this.ctxState);

    let frequencies = [];
    if (bsFrequencies) {
      frequencies = await frequencyRepo.getAllByIds(
        {
          condition: { ids: map(bsFrequencies, 'frequencyId') },
        },
        trx,
      );
    }

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.businessLineId`);

    const item = await query.select(selects);

    if (!item) {
      return null;
    }

    item.frequencies = frequencies;
    item.includedServices = inclServices;
    item.billingCycles = billingCycles;

    return compose(
      super.mapNestedObjects.bind(this, []),
      super.mapJoinedFields,
      this.mapFields,
    )(item);
  }
  //pricing service refactor code:
  async getBillableServiceBySubscription(id, types, excludeTypes, trx = this.knex) {
    if (types?.length || excludeTypes?.length) {
      let query = trx(this.historicalTableName)
        .withSchema(this.schemaName)
        .select(`${this.historicalTableName}.*`)
        .where(`${this.historicalTableName}.id`, id);

      if (types?.length) {
        query = query.whereIn(`${this.historicalTableName}.action`, types);
      }
      if (excludeTypes?.length) {
        query = query.whereNotIn(`${this.historicalTableName}.action`, excludeTypes);
      }
      return await query;
    }
    return null;
  }
}

BillableServiceRepository.TABLE_NAME = TABLE_NAME;

export default BillableServiceRepository;
