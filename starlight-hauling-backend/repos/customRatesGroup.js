/* eslint-disable no-param-reassign */
import compose from 'lodash/fp/compose.js';
import map from 'lodash/fp/map.js';
import compact from 'lodash/compact.js';
import isEmpty from 'lodash/isEmpty.js';
// eslint-disable-next-line import/default
import dateFnsTz from 'date-fns-tz';
import { getDay } from 'date-fns';

import { camelCaseKeys, unambiguousCondition } from '../utils/dbHelpers.js';
import {
  BATCH_RATES_APPLICATION,
  BATCH_UPDATE_TARGET,
  INCLUDE_NONE_MATERIAL,
  INCLUDE_ALL,
} from '../consts/batchRates.js';
import { RATES_SORTING_ATTRIBUTE } from '../consts/ratesSortingAttributes.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import VersionedRepository from './_versioned.js';
import CustomerGroupRepo from './customerGroup.js';
import CustomerRepo from './customer.js';
import JobSiteRepo from './jobSite.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import BillableLineItemRepo from './billableLineItem.js';
import BillableServiceRepo from './billableService.js';
import CustomRateLineItemRepo from './customRatesGroupLineItem.js';
import CustomRateServiceRepo from './customRatesGroupService.js';
import CustomRatesRecServiceFreqRepo from './customRatesGroupRecurringServiceFrequency.js';
import CustomRatesRecLineItemBCycleRepo from './customRatesGroupRecurringLineItemBillingCycle.js';
import MaterialRepo from './material.js';
import EquipmentItemRepo from './equipmentItem.js';
import ServiceAreaCustomRateGroupRepo from './serviceAreaCustomRatesGroup.js';
import ServiceAreaRepo from './serviceArea.js';
import BusinessUnitRepo from './businessUnit.js';
import BusinessLineRepo from './businessLine.js';

const TABLE_NAME = 'custom_rates_groups';
const { zonedTimeToUtc } = dateFnsTz;

const pluckId = map('id');

const applicationToLinkedField = {
  customers: 'customerId',
  customerGroups: 'customerGroupId',
  customerJobSites: 'customerJobSiteId',
};

class CustomRatesGroupRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'description'];
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        Object.entries(obj)
          .filter(([key]) => key !== 'validDays')
          .forEach(([key, value]) => {
            const includedCases = [
              'customerGroup',
              'customer',
              'customerJobSite',
              'jobSite',
              'cjscustomer',
            ];
            if (includedCases.includes(key)) {
              if (!isEmpty(value)) {
                obj[key] = camelCaseKeys(value);
              } else {
                delete obj[key];
              }
            }
          });

        if (obj.cjscustomer && !obj.customer) {
          obj.customer = { ...obj.cjscustomer };
        }
        delete obj.cjscustomer;

        if (obj.jobSite) {
          obj.jobSite = JobSiteRepo.getInstance(this.ctxState).mapFields(obj.jobSite);
        }

        if (obj.customer) {
          obj.customer = CustomerRepo.getInstance(this.ctxState).mapFields(obj.customer, false);
        }

        if (!obj.serviceAreaIds) {
          delete obj.serviceAreaIds;
          delete obj.serviceAreas;
        }

        return obj;
      },
      camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOne({ data: { serviceAreaIds, ...data }, fields = ['*'], log } = {}, trx) {
    let newCustomRatesGroup;

    const _trx = trx || (await this.knex.transaction());

    try {
      if (serviceAreaIds?.length) {
        const activeSAs = await ServiceAreaRepo.getInstance(this.ctxState).getAllByIds(
          {
            ids: serviceAreaIds,
            fields: ['id'],
            condition: { active: true },
          },
          _trx,
        );

        if (!activeSAs?.length) {
          data.active = false;
        }
      }

      newCustomRatesGroup = await super.createOne({ data, fields }, _trx);
      const { id } = newCustomRatesGroup;

      if (serviceAreaIds?.length) {
        await ServiceAreaCustomRateGroupRepo.getInstance(this.ctxState).insertMany(
          {
            data: serviceAreaIds,
            customRatesGroupId: id,
          },
          _trx,
        );

        newCustomRatesGroup.serviceAreaIds = serviceAreaIds;
      }

      if (!trx) {
        await _trx.commit();

        log && this.log({ id, action: this.logAction.create });
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return newCustomRatesGroup;
  }

  async updateBy(
    { condition, data: { serviceAreaIds, ...data }, fields = ['*'], concurrentData, log } = {},
    trx,
  ) {
    const _trx = trx || (await this.knex.transaction());

    let updatedCustomRatesGroup;
    try {
      updatedCustomRatesGroup = await super.updateBy(
        { condition, data, fields, concurrentData },
        _trx,
      );

      const { id } = updatedCustomRatesGroup;
      if (id && serviceAreaIds?.length) {
        const repo = ServiceAreaCustomRateGroupRepo.getInstance(this.ctxState);
        await repo.deleteBy({ condition: { customRatesGroupId: id } }, _trx);

        await repo.insertMany(
          {
            data: serviceAreaIds,
            customRatesGroupId: id,
          },
          _trx,
        );

        updatedCustomRatesGroup.serviceAreaIds = serviceAreaIds;
      }

      if (!trx) {
        await _trx.commit();

        log && this.log({ id, action: this.logAction.modify });
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return updatedCustomRatesGroup;
  }

  strictIncludeCjsRelations({ strictInclude, selects, query }, trx) {
    if (strictInclude.customerGroup) {
      selects.push(trx.raw('to_json(??.*) as ??', [CustomerGroupRepo.TABLE_NAME, 'customerGroup']));

      query = query
        .innerJoin(
          CustomerGroupRepo.TABLE_NAME,
          `${CustomerGroupRepo.TABLE_NAME}.id`,
          `${this.tableName}.customerGroupId`,
        )
        .groupBy(`${CustomerGroupRepo.TABLE_NAME}.id`);
    } else if (strictInclude.customer) {
      selects.push(trx.raw('to_json(??.*) as ??', [CustomerRepo.TABLE_NAME, 'customer']));

      query = query
        .innerJoin(
          CustomerRepo.TABLE_NAME,
          `${CustomerRepo.TABLE_NAME}.id`,
          `${this.tableName}.customerId`,
        )
        .groupBy(`${CustomerRepo.TABLE_NAME}.id`);
    } else if (strictInclude.customerJobSite) {
      selects.push(
        trx.raw('to_json(??.*) as ??', [CustomerJobSitePairRepo.TABLE_NAME, 'customerJobSite']),
      );

      query = query
        .innerJoin(
          CustomerJobSitePairRepo.TABLE_NAME,
          `${CustomerJobSitePairRepo.TABLE_NAME}.id`,
          `${this.tableName}.customerJobSiteId`,
        )
        .groupBy(`${CustomerJobSitePairRepo.TABLE_NAME}.id`);

      selects.push(
        trx.raw('to_json(??.*) as ??', [JobSiteRepo.TABLE_NAME, 'jobSite']),
        trx.raw('to_json(??.*) as ??', ['cjscustomer', 'cjscustomer']),
      );

      query = query
        .leftJoin(
          JobSiteRepo.TABLE_NAME,
          `${JobSiteRepo.TABLE_NAME}.id`,
          `${CustomerJobSitePairRepo.TABLE_NAME}.jobSiteId`,
        )
        .groupBy(`${JobSiteRepo.TABLE_NAME}.id`)
        .joinRaw(
          `
                    left join "${this.schemaName}"."${CustomerRepo.TABLE_NAME}" cjscustomer
                        on cjscustomer.id = "${CustomerJobSitePairRepo.TABLE_NAME}".customer_id
                `,
        )
        .groupBy('cjscustomer.id');
    } else if (strictInclude.serviceArea) {
      query = query.innerJoin(
        ServiceAreaCustomRateGroupRepo.TABLE_NAME,
        `${ServiceAreaCustomRateGroupRepo.TABLE_NAME}.custom_rates_group_id`,
        `${this.tableName}.id`,
      );

      selects.push(
        trx.raw(`nullif(array_agg(??.??), '{NULL}') as ??`, [
          ServiceAreaCustomRateGroupRepo.TABLE_NAME,
          'serviceAreaId',
          'serviceAreaIds',
        ]),
      );
    }

    return { selects, query };
  }

  includeCjsRelations({ include, selects, query }, trx) {
    if (include.customerGroup) {
      selects.push(trx.raw('to_json(??.*) as ??', [CustomerGroupRepo.TABLE_NAME, 'customerGroup']));

      query = query
        .leftJoin(
          CustomerGroupRepo.TABLE_NAME,
          `${CustomerGroupRepo.TABLE_NAME}.id`,
          `${this.tableName}.customerGroupId`,
        )
        .groupBy(`${CustomerGroupRepo.TABLE_NAME}.id`);
    }
    if (include.customer) {
      selects.push(trx.raw('to_json(??.*) as ??', [CustomerRepo.TABLE_NAME, 'customer']));

      query = query
        .leftJoin(
          CustomerRepo.TABLE_NAME,
          `${CustomerRepo.TABLE_NAME}.id`,
          `${this.tableName}.customerId`,
        )
        .groupBy(`${CustomerRepo.TABLE_NAME}.id`);
    }
    if (include.customerJobSite) {
      selects.push(
        trx.raw('to_json(??.*) as ??', [CustomerJobSitePairRepo.TABLE_NAME, 'customerJobSite']),
      );

      query = query
        .leftJoin(
          CustomerJobSitePairRepo.TABLE_NAME,
          `${CustomerJobSitePairRepo.TABLE_NAME}.id`,
          `${this.tableName}.customerJobSiteId`,
        )
        .groupBy(`${CustomerJobSitePairRepo.TABLE_NAME}.id`);

      selects.push(
        trx.raw('to_json(??.*) as ??', [JobSiteRepo.TABLE_NAME, 'jobSite']),
        trx.raw('to_json(??.*) as ??', ['cjscustomer', 'cjscustomer']),
      );

      query = query
        .leftJoin(
          JobSiteRepo.TABLE_NAME,
          `${JobSiteRepo.TABLE_NAME}.id`,
          `${CustomerJobSitePairRepo.TABLE_NAME}.jobSiteId`,
        )
        .groupBy(`${JobSiteRepo.TABLE_NAME}.id`)
        .joinRaw(
          `
                    left join "${this.schemaName}"."${CustomerRepo.TABLE_NAME}" cjscustomer
                        on cjscustomer.id = "${CustomerJobSitePairRepo.TABLE_NAME}".customer_id
                `,
        )
        .groupBy('cjscustomer.id');
    }
    if (include.serviceArea) {
      query = query.leftJoin(
        ServiceAreaCustomRateGroupRepo.TABLE_NAME,
        `${ServiceAreaCustomRateGroupRepo.TABLE_NAME}.custom_rates_group_id`,
        `${this.tableName}.id`,
      );

      selects.push(
        trx.raw(`nullif(array_agg(??.??), '{NULL}') as ??`, [
          ServiceAreaCustomRateGroupRepo.TABLE_NAME,
          'serviceAreaId',
          'serviceAreaIds',
        ]),
      );
    }

    return { selects, query };
  }

  populateDataQuery({ fields, strictInclude, include }, trx = this.knex) {
    let selects = fields.map(field => `${this.tableName}.${field}`);

    let query = trx(this.tableName).withSchema(this.schemaName).groupBy(`${this.tableName}.id`);

    if (strictInclude) {
      ({ query, selects } = this.strictIncludeCjsRelations({ strictInclude, query, selects }, trx));
    } else if (include) {
      ({ query, selects } = this.includeCjsRelations({ include, query, selects }, trx));
    }

    return query.select(...selects);
  }

  async getAllPopulated({
    fields = ['*'],
    condition,
    sortBy = RATES_SORTING_ATTRIBUTE.id,
    sortOrder = SORT_ORDER.desc,
    skip = 0,
    limit = 25,
    strictInclude,
    include,
  }) {
    const sortField = this.customRatesSortBy(sortBy);
    const query = this.populateDataQuery({ fields, strictInclude, include })
      .where(unambiguousCondition(this.tableName, condition))
      .orderBy(sortField, sortOrder)
      .offset(skip);

    const items = await (limit ? query.limit(limit) : query);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getBy({ condition: { id }, fields = ['*'] } = {}) {
    const item = await this.populateDataQuery({
      fields,
      include: {
        customerGroup: true,
        customer: true,
        customerJobSite: true,
        serviceArea: true,
      },
    })
      .where(`${this.tableName}.id`, id)
      .first();

    return item ? this.mapFields(item) : null;
  }

  async getActiveRatesGroups({
    condition: {
      serviceDate,
      customerGroupId,
      customerId,
      customerJobSiteId,
      businessUnitId,
      businessLineId,
      serviceAreaId,
    } = {},
    fields = ['*'],
    trx = this.knex,
  }) {
    const weekendDay = getDay(zonedTimeToUtc(serviceDate, 'UTC'));
    const bindings = [weekendDay];
    let q = 'active = true AND ? = ANY(valid_days) AND ( ';
    let or = false;

    if (customerGroupId) {
      q += '(?? = ?)';
      or = true;
      bindings.push('customerGroupId', customerGroupId);
    }

    if (serviceAreaId) {
      q += or ? ' OR (?? = ?)' : '(?? = ?)';
      or = true;
      bindings.push('serviceAreaId', serviceAreaId);
    }

    if (customerId) {
      q += or ? ' OR (?? = ?)' : '(?? = ?)';
      or = true;
      bindings.push('customerId', customerId);
    }
    if (customerJobSiteId) {
      q += or ? ' OR (?? = ?)' : '(?? = ?)';
      bindings.push('customerJobSiteId', customerJobSiteId);
    }

    q += ' )';

    let query = trx(this.tableName).withSchema(this.schemaName);
    let selects = fields;
    if (serviceAreaId) {
      const serviceAreaRatesTN = ServiceAreaCustomRateGroupRepo.TABLE_NAME;
      query = query.leftJoin(
        serviceAreaRatesTN,
        `${serviceAreaRatesTN}.customRatesGroupId`,
        `${this.tableName}.id`,
      );
      // .groupBy([`${this.tableName}.id`, `${serviceAreaRatesTN}.id`])
      // .orderBy(`${serviceAreaRatesTN}.id`, SORT_ORDER.asc);

      selects = fields.map(field => `${this.tableName}.${field}`);

      selects.push(`${serviceAreaRatesTN}.serviceAreaId as serviceAreaId`);
    }

    query = query
      .select(selects)
      .whereRaw(q, bindings)
      .andWhereRaw(
        `(start_date <= ? or start_date is null) and (end_date >= ? or end_date is null)`,
        [serviceDate, serviceDate],
      );
    // TODO: refactor to aggregate filters properly:
    if (businessUnitId) {
      query = query.andWhere(`${this.tableName}.businessUnitId`, businessUnitId);
    }
    if (businessLineId) {
      query = query.andWhere(`${this.tableName}.businessLineId`, businessLineId);
    }

    const items = await query.orderBy(`${this.tableName}.id`);

    return items;
  }

  async getRateLinkedItems({ condition }, trx = this.knex) {
    const result = await this.knex(`${this.schemaName}.${this.tableName}`)
      .select(
        trx.raw('json_agg(DISTINCT ??.*) as ??', ['customers', 'customers']),
        trx.raw('json_agg(DISTINCT cjs.*) as ??', ['customerJobSites']),
        trx.raw('json_agg(DISTINCT ??.*) as ??', ['customerGroups', 'customerGroups']),
      )
      .leftJoin(`${this.schemaName}.customers`, 'customers.id', `${this.tableName}.customerId`)
      .leftJoin(
        trx(CustomerJobSitePairRepo.TABLE_NAME)
          .withSchema(this.schemaName)
          .select(
            `${CustomerJobSitePairRepo.TABLE_NAME}.*`,
            trx.raw('jsonb_agg(??.*) as ??', [CustomerRepo.TABLE_NAME, 'customer']),
            trx.raw('jsonb_agg(??.*) as ??', [JobSiteRepo.TABLE_NAME, 'jobSite']),
          )
          .leftJoin(
            CustomerRepo.TABLE_NAME,
            `${CustomerRepo.TABLE_NAME}.id`,
            `${CustomerJobSitePairRepo.TABLE_NAME}.customerId`,
          )
          .leftJoin(
            JobSiteRepo.TABLE_NAME,
            `${JobSiteRepo.TABLE_NAME}.id`,
            `${CustomerJobSitePairRepo.TABLE_NAME}.jobSiteId`,
          )
          .groupBy(`${CustomerJobSitePairRepo.TABLE_NAME}.id`)
          .as('cjs'),
        'cjs.id',
        `${this.tableName}.customerJobSiteId`,
      )
      .leftJoin(
        `${this.schemaName}.customerGroups`,
        'customerGroups.id',
        `${this.tableName}.customerGroupId`,
      )
      .where(unambiguousCondition(this.tableName, condition))
      .first();

    if (!result) {
      return null;
    }

    Object.keys(result).forEach(key => {
      result[key] = compact(result[key]);
    });

    const csRepo = CustomerRepo.getInstance(this.ctxState);
    result.customers = result.customers.map(customer => csRepo.mapFields(customer, false));

    const cgRepo = CustomerGroupRepo.getInstance(this.ctxState);
    result.customerGroups = result.customerGroups.map(cgRepo.mapFields.bind(this));

    const cjsRepo = CustomerJobSitePairRepo.getInstance(this.ctxState);
    const jsRepo = JobSiteRepo.getInstance(this.ctxState);

    result.customerJobSites = result.customerJobSites.map(cjsPair => {
      const mappedCjs = cjsRepo.mapFields(cjsPair);

      if (mappedCjs.customer[0]) {
        mappedCjs.customer = csRepo.mapFields(mappedCjs.customer[0]);
      }

      if (mappedCjs.jobSite[0]) {
        mappedCjs.jobSite = jsRepo.mapFields(mappedCjs.jobSite[0]);
      }

      return mappedCjs;
    });

    return result;
  }

  async getBatchUpdateTargetRateGroups({
    fields = ['id', 'description'],
    condition,
    application,
    applyTo,
  }) {
    const items = await this.populateDataQuery({
      fields,
      include: { customerGroup: true, customer: true, customerJobSite: true },
    })
      .whereIn(
        application === BATCH_RATES_APPLICATION.specificPriceGroups
          ? `${this.tableName}.id`
          : `${this.tableName}.${applicationToLinkedField[application]}`,
        applyTo,
      )
      .andWhere(unambiguousCondition(this.tableName, condition));

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  // pre-pricing service refactor code:
  // async batchRatesUpdate(data, trx, { log = false } = {}) {
  //   this.ctxState.logger.debug(data, 'customRatesGroupRepo->batchRatesUpdate->data');
  //   const _trx = trx || (await this.knex.transaction());
  //   const fields = ['id'];
  //   this.ctxState.logger.debug(
  //     `customRatesGroupRepo->batchRatesUpdate->data.target: ${data.target}`,
  //   );

  //   const updateServices =
  //     data.target === BATCH_UPDATE_TARGET.all || data.target === BATCH_UPDATE_TARGET.services;
  //   const updateRecurringServices =
  //     data.target === BATCH_UPDATE_TARGET.all ||
  //     data.target === BATCH_UPDATE_TARGET.recurringServices;
  //   const updateLineItems =
  //     data.target === BATCH_UPDATE_TARGET.all || data.target === BATCH_UPDATE_TARGET.lineItems;
  //   const updateRecurringLineItems =
  //     data.target === BATCH_UPDATE_TARGET.all ||
  //     data.target === BATCH_UPDATE_TARGET.recurringLineItems;
  // end pre-pricing service refactor code
  // added for pricing service refactor
  batchValidateData(data) {
    const updateServices =
      data.target === BATCH_UPDATE_TARGET.all || data.target === BATCH_UPDATE_TARGET.services;
    const updateRecurringServices =
      data.target === BATCH_UPDATE_TARGET.all ||
      data.target === BATCH_UPDATE_TARGET.recurringServices;
    const updateLineItems =
      data.target === BATCH_UPDATE_TARGET.all || data.target === BATCH_UPDATE_TARGET.lineItems;
    const updateRecurringLineItems =
      data.target === BATCH_UPDATE_TARGET.all ||
      data.target === BATCH_UPDATE_TARGET.recurringLineItems;
    // end added for pricing service refactor
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->updateServices: ${updateServices}`,
    );
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->updateRecurringServices: ${updateRecurringServices}`,
    );
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->updateLineItems: ${updateLineItems}`,
    );
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->updateRecurringLineItems: ${updateRecurringLineItems}`,
    );

    return {
      updateServices,
      updateRecurringServices,
      updateLineItems,
      updateRecurringLineItems,
    };
  }
  async getDataBatchRatesUpdate({ _trx, fields, data }) {
    const lineItemsQuery = BillableLineItemRepo.getInstance(this.ctxState)
      .getAll({ fields }, _trx)
      .where('businessLineId', data.businessLineId);

    const includeAllLineItems = data.lineItems?.findIndex(item => item === INCLUDE_ALL);
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->includeAllLineItems: ${includeAllLineItems}`,
    );

    if (data.lineItems?.length && includeAllLineItems === -1) {
      lineItemsQuery.whereIn('id', data.lineItems);
    }

    const servicesQuery = BillableServiceRepo.getInstance(this.ctxState)
      .getAll({ fields }, _trx)
      .where('businessLineId', data.businessLineId);

    const includeAllServices = data.services?.findIndex(item => item === INCLUDE_ALL);
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->includeAllServices: ${includeAllServices}`,
    );

    if (data.services?.length && includeAllServices === -1) {
      servicesQuery.whereIn('id', data.services);
    }

    const materialsQuery = MaterialRepo.getInstance(this.ctxState)
      .getAll({ fields }, _trx)
      .where('businessLineId', data.businessLineId);

    const includeAllMaterials = data.materials?.findIndex(item => item === INCLUDE_ALL);
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->includeAllMaterials: ${includeAllMaterials}`,
    );

    if (includeAllMaterials >= 0) {
      data.materials.splice(includeAllMaterials, 1);
    }

    const includeNonMaterial = data.materials?.findIndex(item => item === INCLUDE_NONE_MATERIAL);
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->includeNonMaterial: ${includeNonMaterial}`,
    );

    if (includeNonMaterial >= 0) {
      data.materials.splice(includeNonMaterial, 1);
    }

    // handle case when only non material selected
    const shouldQueryMaterials = includeAllMaterials > -1 || data.materials?.length;
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->shouldQueryMaterials: ${shouldQueryMaterials}`,
    );

    if (data.materials?.length && includeAllMaterials === -1) {
      materialsQuery.whereIn('id', data.materials);
    }

    const equipmentItemsQuery = EquipmentItemRepo.getInstance(this.ctxState)
      .getAll({ fields }, _trx)
      .where('businessLineId', data.businessLineId);

    const includeAllEquipmentItems = data.equipmentItems?.findIndex(item => item === INCLUDE_ALL);
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->includeAllEquipmentItems: ${includeAllEquipmentItems}`,
    );

    if (data.equipmentItems?.length && includeAllEquipmentItems === -1) {
      equipmentItemsQuery.whereIn('id', data.equipmentItems);
    }
    return {
      lineItemsQuery,
      servicesQuery,
      equipmentItemsQuery,
      shouldQueryMaterials,
      materialsQuery,
      includeNonMaterial,
    };
  }

  async batchRatesUpdate(data, trx, { log = false } = {}) {
    this.ctxState.logger.debug(data, 'customRatesGroupRepo->batchRatesUpdate->data');
    const _trx = trx || (await this.knex.transaction());
    const fields = ['id'];
    this.ctxState.logger.debug(
      `customRatesGroupRepo->batchRatesUpdate->data.target: ${data.target}`,
    );

    const { updateServices, updateRecurringServices, updateLineItems, updateRecurringLineItems } =
      this.batchValidateData(data);

    try {
      const {
        lineItemsQuery,
        servicesQuery,
        equipmentItemsQuery,
        shouldQueryMaterials,
        materialsQuery,
        includeNonMaterial,
      } = await this.getDataBatchRatesUpdate({ _trx, fields, data });

      const [ratesGroups, billableLineItems, billableServices, equipmentItems, materials] =
        await Promise.all([
          this.populateDataQuery({ fields }, _trx)
            .whereIn(
              data.application === BATCH_RATES_APPLICATION.specificPriceGroups
                ? `${this.tableName}.id`
                : applicationToLinkedField[data.application],
              data.applyTo,
            )
            .andWhere({
              businessLineId: data.businessLineId,
              businessUnitId: data.businessUnitId,
            }),
          updateLineItems || updateRecurringLineItems ? lineItemsQuery : Promise.resolve(),
          updateServices || updateRecurringServices ? servicesQuery : Promise.resolve(),
          updateServices || updateRecurringServices ? equipmentItemsQuery : Promise.resolve(),
          (updateLineItems ||
            updateRecurringLineItems ||
            updateServices ||
            updateRecurringServices) &&
          shouldQueryMaterials
            ? materialsQuery
            : Promise.resolve(),
        ]);

      this.ctxState.logger.debug(
        ratesGroups,
        'customRatesGroupRepo->batchRatesUpdate->ratesGroups',
      );
      this.ctxState.logger.debug(
        billableLineItems,
        'customRatesGroupRepo->batchRatesUpdate->billableLineItems',
      );
      this.ctxState.logger.debug(
        billableServices,
        'customRatesGroupRepo->batchRatesUpdate->billableServices',
      );
      this.ctxState.logger.debug(
        equipmentItems,
        'customRatesGroupRepo->batchRatesUpdate->equipmentItems',
      );
      this.ctxState.logger.debug(materials, 'customRatesGroupRepo->batchRatesUpdate->materials');

      const customRateGroupIds = pluckId(ratesGroups);
      this.ctxState.logger.debug(
        customRateGroupIds,
        'customRatesGroupRepo->batchRatesUpdate->customRateGroupIds',
      );
      const materialIds = pluckId(materials);
      this.ctxState.logger.debug(
        materialIds,
        'customRatesGroupRepo->batchRatesUpdate->materialIds',
      );

      const [
        updateLineItemsResult,
        updateRecurringLineItemsResult,
        updateServicesResult,
        updateRecurringServicesResult,
      ] = await Promise.all([
        updateLineItems
          ? CustomRateLineItemRepo.getInstance(this.ctxState).batchRatesUpdate(
              {
                lineItemIds: pluckId(billableLineItems),
                materialIds,
                customRateGroupIds,
                updateNoneMaterialRates: includeNonMaterial >= 0,
                ...data,
                log,
              },
              _trx,
            )
          : Promise.resolve(),
        updateRecurringLineItems
          ? CustomRatesRecLineItemBCycleRepo.getInstance(this.ctxState).batchRatesUpdate(
              { lineItemIds: pluckId(billableLineItems), customRateGroupIds, ...data },
              _trx,
            )
          : Promise.resolve(),
        updateServices
          ? CustomRateServiceRepo.getInstance(this.ctxState).batchRatesUpdate(
              {
                serviceIds: pluckId(billableServices),
                materialIds,
                equipmentItemIds: pluckId(equipmentItems),
                customRateGroupIds,
                updateNoneMaterialRates: includeNonMaterial >= 0,
                ...data,
                log,
              },
              _trx,
            )
          : Promise.resolve(),
        updateRecurringServices
          ? CustomRatesRecServiceFreqRepo.getInstance(this.ctxState).batchRatesUpdate(
              {
                serviceIds: pluckId(billableServices),
                materialIds: pluckId(materials),
                equipmentItemIds: pluckId(equipmentItems),
                customRateGroupIds,
                ...data,
              },
              _trx,
            )
          : Promise.resolve(),
      ]);

      if (!trx) {
        await _trx.commit();
      }

      if (data.checkPendingUpdates) {
        let isPendingUpdates = false;
        if (
          !isEmpty(updateLineItemsResult) ||
          !isEmpty(updateRecurringLineItemsResult) ||
          !isEmpty(updateServicesResult) ||
          !isEmpty(updateRecurringServicesResult)
        ) {
          isPendingUpdates = true;
        }
        return { isPendingUpdates };
      }
      return null;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async deactivateByServiceArea({ id, log }, trx) {
    const allServiceAreaGroups = await ServiceAreaCustomRateGroupRepo.getInstance(
      this.ctxState,
    ).getAll({}, trx);

    if (allServiceAreaGroups?.length) {
      allServiceAreaGroups
        .filter(item => item.serviceAreaId === +id)
        .map(async priceGroup => {
          // check if only one priceGroup linked to service area
          const priceGroups = allServiceAreaGroups.filter(
            item => item.customRatesGroupId === priceGroup.customRatesGroupId,
          );

          if (priceGroups.length === 1) {
            await this.updateBy(
              {
                condition: { id: priceGroups[0].customRatesGroupId },
                data: { active: false },
                log,
              },
              trx,
            );
          }
        }, this);
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super
      .getByIdQuery(id, trx)
      .groupBy(`${this.tableName}.id`)
      .orderBy(`${this.tableName}.id`);

    let selects = [`${this.tableName}.*`];
    ({ query, selects } = this.includeCjsRelations(
      {
        include: {
          customerGroup: true,
          customer: true,
          customerJobSite: true,
          serviceArea: true,
        },
        query,
        selects,
      },
      trx,
    ));

    query = query.leftJoin(
      ServiceAreaRepo.TABLE_NAME,
      `${ServiceAreaRepo.TABLE_NAME}.id`,
      `${ServiceAreaCustomRateGroupRepo.TABLE_NAME}.service_area_id`,
    );

    selects.push(trx.raw('json_agg(??.*) as ??', [ServiceAreaRepo.TABLE_NAME, 'serviceAreas']));

    ({ query, selects } = await super.populateBuBl({ query, selects }));

    const item = await query
      .groupBy([`${BusinessUnitRepo.TABLE_NAME}.id`, `${BusinessLineRepo.TABLE_NAME}.id`])
      .select(selects);

    return item
      ? compose(super.mapNestedObjects.bind(this, []), super.mapJoinedFields, this.mapFields)(item)
      : null;
  }

  customRatesSortBy(sortBy) {
    const sortedFields = {
      id: `${this.tableName}.id`,
      status: `${this.tableName}.active`,
      startDate: `${this.tableName}.startDate`,
      endDate: `${this.tableName}.endDate`,
      description: `${this.tableName}.description`,
    };
    return sortedFields[sortBy] || sortedFields.id;
  }
}

CustomRatesGroupRepository.TABLE_NAME = TABLE_NAME;

export default CustomRatesGroupRepository;
