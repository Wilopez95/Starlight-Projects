import isEmpty from 'lodash/isEmpty.js';
import pick from 'lodash/fp/pick.js';
import compose from 'lodash/fp/compose.js';
import { addDays } from 'date-fns';
// pre-pricing service refactor code:
// import { getNewestRatesForRecurrentOrderTemplate } from '../services/recurrentOrder.js';
// import { mathRound2 } from '../utils/math.js';
// import { unambiguousCondition, unambiguousSelect } from '../utils/dbHelpers.js';
import { getNewestRatesForRecurrentOrderTemplatePricing } from '../services/recurrentOrder.js';
import { mathRound2 } from '../utils/math.js';
import { unambiguousSelect } from '../utils/dbHelpers.js';
import { calculateSurcharges } from '../services/orderSurcharges.js';
import { calcRates } from '../services/orderRates.js';
import ApiError from '../errors/ApiError.js';
import fieldToLinkedTableMap from '../consts/fieldToLinkedTableMap.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import {
  RECURRENT_TEMPLATE_STATUS,
  RECURRENT_TEMPLATE_SORTING_ATTRIBUTE,
} from '../consts/recurrentOrderTemplates.js';
import {
  cjsPairFields,
  linkedFields as linkedInputFields,
  nonLinkedFields as nonLinkedInputFields,
  recurrentOrderTemplateFields,
  recurrentOrderTemplateGridFields,
} from '../consts/recurrentTemplateFields.js';
import {
  pricingAddRecurrentOrder,
  pricingAddRecurrentOrderTemplateLineItems,
  pricingGetDataForGeneration,
} from '../services/pricing.js';
import BaseRepository from './_base.js';
import VersionedRepository from './_versioned.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import RecurrentLineItemRepo from './recurrentOrderTemplateLineItem.js';
import RecurrentOrderTemplateOrderRepo from './recurrentOrderTemplateOrder.js';
import CustomerRepo from './customer.js';
import JobSiteRepo from './jobSite.js';
import BillableSurchargeRepo from './billableSurcharge.js';
import BusinessUnitRepository from './businessUnit.js';
import BusinessLineRepository from './businessLine.js';
import ServiceAreaRepository from './serviceArea.js';
import BillableServiceRepo from './billableService.js';
import ContactRepository from './contact.js';
import CustomerGroupRepository from './customerGroup.js';
import PurchaseOrderRepo from './purchaseOrder.js';

const TABLE_NAME = 'recurrent_order_templates';

const getCustomerJobSitePairInputFields = pick(cjsPairFields);

const getNonLinkedInputFields = pick(nonLinkedInputFields);

const getLinkedInputFields = pick(linkedInputFields);

class RecurrentOrderTemplateRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      obj => {
        if (obj.customer) {
          obj.customer = CustomerRepo.prototype.mapFields.call(this, obj.customer);
        }
        if (obj.originalCustomer) {
          obj.originalCustomer = CustomerRepo.prototype.mapFields.call(this, obj.originalCustomer);
        }
        if (obj.jobSite) {
          obj.jobSite = JobSiteRepo.prototype.mapFields.call(this, obj.jobSite);
        }

        return obj;
      },
      super.mapNestedObjects.bind(this, [
        'lineItems',
        'bbox',
        'taxDistricts',
        'frequencyDays',
        'customer',
        'originalCustomer',
        'jobSite',
      ]),
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  static getRecurrentOrderTemplateFields() {
    return recurrentOrderTemplateFields;
  }

  static getRecurrentOrderTemplateGridFields() {
    return recurrentOrderTemplateGridFields;
  }

  populateDataQuery(fields, trx = this.knex, { pullSelects = false } = {}) {
    let query = trx(this.tableName).withSchema(this.schemaName).groupBy(`${this.tableName}.id`);

    const linkedFields = [];
    const nonLinkedFields = ['callOnWayPhoneNumberId', 'textOnWayPhoneNumberId', 'purchaseOrderId'];
    const fieldsToExclude = [
      'lineItems',
      'thresholds',
      'taxDistricts',
      'csrEmail',
      'workOrderId',
      'businessUnitId',
      'businessLineId',
      'serviceAreaId',
      'customerJobSiteId',
      'callOnWayPhoneNumberId',
      'textOnWayPhoneNumberId',
      'purchaseOrderId',
      'customer',
    ];

    let bothContactsJoinCase = false;
    if (fields.includes('jobSiteContactId') && fields.includes('orderContactId')) {
      bothContactsJoinCase = true;
      fieldsToExclude.push('jobSiteContactId', 'orderContactId');
    }

    fields
      .filter(field => !fieldsToExclude.includes(field))
      .forEach(field =>
        field.endsWith('Id') ? linkedFields.push(field) : nonLinkedFields.push(field),
      );

    const selects = nonLinkedFields.map(field => `${this.tableName}.${field}`);

    linkedFields.forEach(field => {
      const targetTable = BaseRepository.getHistoricalTableName(fieldToLinkedTableMap[field]);

      selects.push(trx.raw('to_json(??.*) as ??', [targetTable, field.slice(0, -2)]));

      query = query
        .leftJoin(targetTable, `${targetTable}.id`, `${this.tableName}.${field}`)
        .groupBy(`${targetTable}.id`);
    });

    if (fields.includes('businessUnitId')) {
      selects.push(
        trx.raw('to_json(??.*) as ??', [BusinessUnitRepository.TABLE_NAME, 'businessUnit']),
      );

      query = query
        .innerJoin(
          BusinessUnitRepository.TABLE_NAME,
          `${this.tableName}.businessUnitId`,
          `${BusinessUnitRepository.TABLE_NAME}.id`,
        )
        .groupBy(`${BusinessUnitRepository.TABLE_NAME}.id`);
    }

    if (fields.includes('customer')) {
      selects.push(
        trx.raw('to_json(??.*) as ??', [CustomerRepo.getHistoricalTableName(), 'customer']),
      );
      query = query
        .innerJoin(
          CustomerRepo.getHistoricalTableName(),
          `${CustomerRepo.getHistoricalTableName()}.id`,
          `${this.tableName}.customerId`,
        )
        .groupBy(`${CustomerRepo.getHistoricalTableName()}.id`);
    }

    if (fields.includes('businessLineId')) {
      selects.push(
        trx.raw('to_json(??.*) as ??', [BusinessLineRepository.TABLE_NAME, 'businessLine']),
      );

      query = query
        .innerJoin(
          BusinessLineRepository.TABLE_NAME,
          `${this.tableName}.businessLineId`,
          `${BusinessLineRepository.TABLE_NAME}.id`,
        )
        .groupBy(`${BusinessLineRepository.TABLE_NAME}.id`);
    }

    if (fields.includes('customerJobSiteId')) {
      selects.push(
        trx.raw('to_json(??.*) as ??', [CustomerJobSitePairRepo.TABLE_NAME, 'customerJobSite']),
      );

      query = query
        .innerJoin(
          CustomerJobSitePairRepo.TABLE_NAME,
          `${this.tableName}.customerJobSiteId`,
          `${CustomerJobSitePairRepo.TABLE_NAME}.id`,
        )
        .groupBy(`${CustomerJobSitePairRepo.TABLE_NAME}.id`);
    }

    if (fields.includes('serviceAreaId')) {
      const serviceAreaHT = ServiceAreaRepository.getHistoricalTableName();
      const serviceAreasBindings = [
        'id',
        'originalId',
        'active',
        'name',
        'description',
        'geometry',
      ].flatMap(field => [field, serviceAreaHT, field]);

      // generate binding query, -1 - geometry
      const bindingQuery = "'??', ??.??,".repeat(serviceAreasBindings.length / 3 - 1);

      selects.push(
        trx.raw(
          `json_build_object(
                        ${bindingQuery}
                            '??', st_asgeojson(??.??)::jsonb)
                        as ??`,
          [...serviceAreasBindings, 'serviceArea'],
        ),
      );

      query = query
        .leftJoin(serviceAreaHT, `${this.tableName}.serviceAreaId`, `${serviceAreaHT}.id`)
        .groupBy(`${serviceAreaHT}.id`);
    }

    if (fields.includes('purchaseOrderId')) {
      selects.push(trx.raw('to_json(??.*) as ??', [PurchaseOrderRepo.TABLE_NAME, 'purchaseOrder']));

      query = query
        .leftJoin(
          PurchaseOrderRepo.TABLE_NAME,
          `${this.tableName}.purchaseOrderId`,
          `${PurchaseOrderRepo.TABLE_NAME}.id`,
        )
        .groupBy(`${PurchaseOrderRepo.TABLE_NAME}.id`);
    }

    if (bothContactsJoinCase) {
      selects.push(`${this.tableName}.jobSiteContactId`, `${this.tableName}.orderContactId`);

      const contactsHt = ContactRepository.getHistoricalTableName();
      selects.push(trx.raw('to_json(??.*) as ??', ['jsc', 'jobSiteContact']));

      query = query
        .joinRaw(
          `
                    left join "${this.schemaName}"."${contactsHt}" jsc
                        on jsc.id = "${this.tableName}".job_site_contact_id
                `,
        )
        .groupBy('jsc.id');

      selects.push(trx.raw('to_json(??.*) as ??', ['oc', 'orderContact']));

      query = query
        .joinRaw(
          `
                    left join "${this.schemaName}"."${contactsHt}" oc
                        on oc.id = "${this.tableName}".order_contact_id
                `,
        )
        .groupBy('oc.id');
    }

    return pullSelects ? { query, selects } : query.select(...selects);
  }

  async prepHistoricalAndComputedFields(data, recurrentOrderTemplateId, trx = this.knex) {
    const result = getNonLinkedInputFields(data);
    const linkedFields = getLinkedInputFields(data);

    const update = !!recurrentOrderTemplateId;
    const historicalLinkedFields = await super.getLinkedHistoricalIds(linkedFields, {
      update,
      entityId: recurrentOrderTemplateId,
      entityRepo: this,
    });

    Object.assign(result, historicalLinkedFields);

    const { lineItems, billableLineItemsTotal } = await this.getLineItemHistoricalIds(
      data.lineItems,
      { update },
    );
    result.lineItems = lineItems;

    result.billableLineItemsTotal = billableLineItemsTotal;
    result.billableServiceTotal = Number(data.billableServicePrice || 0);
    result.beforeTaxesTotal = mathRound2(result.billableServiceTotal + billableLineItemsTotal);

    let surchargesTotal = 0;
    if (data.applySurcharges) {
      const surcharges = await BillableSurchargeRepo.getInstance(this.ctxState).getAll(
        {
          condition: { active: true, businessLineId: data.businessLineId },
        },
        trx,
      );

      const { customRates, globalRates } = await calcRates(
        this.ctxState,
        {
          businessUnitId: data.businessUnitId,
          businessLineId: data.businessLineId,
          customRatesGroupId: data.customRatesGroupId,
          type: data.customRatesGroupId ? 'custom' : 'global',
        },
        trx,
      );

      ({ surchargesTotal } = calculateSurcharges({
        globalRatesSurcharges: globalRates?.globalRatesSurcharges,
        customRatesSurcharges: customRates?.customRatesSurcharges,
        materialId: data.materialId,
        billableServiceId: data.billableServiceId,
        billableServicePrice: data.billableServicePrice,
        billableServiceApplySurcharges: data.billableServiceApplySurcharges,
        lineItems: data.lineItems,
        surcharges,
      }));
    }
    result.surchargesTotal = surchargesTotal;

    result.grandTotal = Number(data.grandTotal);

    result.status = RECURRENT_TEMPLATE_STATUS[data.status];

    if (data.oneTimePurchaseOrderNumber) {
      const { id } = await PurchaseOrderRepo.getInstance(this.ctxState).softUpsert(
        {
          data: {
            customerId: data.customerId,
            poNumber: data.oneTimePurchaseOrderNumber,
            isOneTime: true,
            active: true,
          },
        },
        trx,
      );

      result.purchaseOrderId = id;
    }

    return result;
  }

  async getLineItemHistoricalIds(lineItems, { update = false } = {}) {
    const lineItemArray = lineItems ? Array.from({ length: lineItems.length }) : [];
    let billableLineItemsTotal = 0;
    const entityRepo = RecurrentLineItemRepo.getInstance(this.ctxState);

    if (!isEmpty(lineItems)) {
      await Promise.all(
        lineItems.map(async (item, i) => {
          billableLineItemsTotal += mathRound2(
            Number(item.price || 0) * Number(item.quantity || 1),
          );

          const updatedItem = await super.getLinkedHistoricalIds(
            pick([
              'billableLineItemId',
              'materialId',
              'globalRatesLineItemsId',
              'customRatesGroupLineItemsId',
            ])(item),
            {
              update: !!(update && item?.id),
              entityId: item?.id,
              entityRepo,
            },
          );

          lineItemArray[i] = { ...item, ...updatedItem };
        }, this),
      );
    }

    return { lineItems: lineItemArray, billableLineItemsTotal };
  }

  async getBy({ condition: { id }, fields = ['*'] } = {}, trx = this.knex) {
    let bindings = [];
    if (id) {
      bindings = [this.tableName, 'id', id];
    }

    const result = await this.populateDataQuery(fields, trx).whereRaw('??.?? = ?', bindings);

    if (isEmpty(result) || !result[0]) {
      return null;
    }

    const mapFields = this.mapFields.bind(this);
    const recurrentOrderTemplate = mapFields(result[0]);

    // + fields: ['lineItems'] - fetch populated line items
    if (fields.includes('lineItems') || fields[0] === '*') {
      recurrentOrderTemplate.lineItems = await RecurrentLineItemRepo.getInstance(
        this.ctxState,
      ).populateLineItemsByOrderId(recurrentOrderTemplate.id, trx);
    }

    return recurrentOrderTemplate;
  }

  async getAllPaginated(
    {
      condition: { customerId, searchQuery } = {},
      skip = 0,
      limit = 25,
      sortBy = RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.startDate,
      sortOrder = SORT_ORDER.desc,
      fields = RecurrentOrderTemplateRepository.getRecurrentOrderTemplateGridFields(),
    } = {},
    trx = this.knex,
  ) {
    let query = this.populateDataQuery(fields, trx).andWhere({
      [`${CustomerRepo.getHistoricalTableName()}.originalId`]: customerId,
    });

    if (limit) {
      query = query.limit(limit).offset(skip);
    }

    if (searchQuery?.length >= 3) {
      const jobSiteHT = JobSiteRepo.getHistoricalTableName();

      if (!fields.includes('jobSiteId')) {
        query = query.join(jobSiteHT, `${jobSiteHT}.id`, `${this.tableName}.jobSiteId`);
      }

      query = query.join(
        JobSiteRepo.TABLE_NAME,
        `${jobSiteHT}.originalId`,
        `${JobSiteRepo.TABLE_NAME}.id`,
      );
    }

    query = this.applySearchToQuery(query, { searchQuery });

    let sortingField = 'id';
    if (sortBy !== RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.id) {
      switch (sortBy) {
        case RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.startDate:
          sortingField = 'startDate';
          break;
        case RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.nextServiceDate:
          sortingField = 'nextServiceDate';
          break;
        case RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.status:
          sortingField = 'status';
          break;
        case RECURRENT_TEMPLATE_SORTING_ATTRIBUTE.grandTotal:
          sortingField = 'grandTotal';
          break;
        default:
          throw ApiError.invalidRequest(
            'Unsupported sorting field',
            `Unsupported sorting field ${sortBy}`,
          );
      }
    }

    query = query.groupBy(`${this.tableName}.${sortingField}`);
    query = query.orderBy(`${this.tableName}.${sortingField}`, sortOrder);

    const items = await query
      .groupBy(`${this.tableName}.${sortingField}`)
      .orderBy(`${this.tableName}.${sortingField}`, sortOrder);

    if (isEmpty(items)) {
      return [];
    }

    return items?.map(this.mapFields.bind(this));
  }

  applySearchToQuery(originalQuery, { searchQuery }) {
    let query = originalQuery;

    query = query.andWhere(builder => {
      if (searchQuery?.length >= 3) {
        builder
          .orWhereRaw('? <% ??.full_address', [searchQuery, JobSiteRepo.TABLE_NAME])
          .orderByRaw('? <<-> ??.full_address', [searchQuery, JobSiteRepo.TABLE_NAME]);
      }

      return builder;
    });

    return query;
  }

  async count({ condition: { customerId, searchQuery } } = {}, trx = this.knex) {
    const customersHT = CustomerRepo.getHistoricalTableName();

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
      .andWhere(`${customersHT}.originalId`, customerId)
      .count(`${this.tableName}.id`)
      .first();

    if (searchQuery?.length >= 3) {
      const jobSiteHT = JobSiteRepo.getHistoricalTableName();

      query = query
        .join(jobSiteHT, `${jobSiteHT}.id`, `${this.tableName}.jobSiteId`)
        .join(JobSiteRepo.TABLE_NAME, `${jobSiteHT}.originalId`, `${JobSiteRepo.TABLE_NAME}.id`);
    }

    query = this.applySearchToQuery(query, { searchQuery });

    const result = await query;

    return Number(result?.count || 0);
  }

  async createOne({ data, log } = {}, ctx) {
    data.status = RECURRENT_TEMPLATE_STATUS.active;
    const trx = await this.knex.transaction();

    let recurrentOrderTemplate;

    try {
      const { lineItems, ...insertData } = await this.prepHistoricalAndComputedFields(
        data,
        null,
        trx,
      );

      const cjsRepo = CustomerJobSitePairRepo.getInstance(this.ctxState);
      const { customerId, jobSiteId } = data;

      let linkedPair = await cjsRepo.getBy(
        {
          condition: { customerId, jobSiteId },
          fields: ['id'],
        },
        trx,
      );

      if (!linkedPair) {
        const pairData = getCustomerJobSitePairInputFields(data);

        linkedPair = await cjsRepo.createOne(
          {
            data: { ...pairData, active: true },
            condition: { customerId, jobSiteId },
            log,
          },
          trx,
        );
      }

      if (linkedPair) {
        insertData.customerJobSiteId = linkedPair.id;
      }

      // recurrentOrderTemplate = await super.createOne({ data: insertData, fields: ['id'] }, trx);
      recurrentOrderTemplate = await pricingAddRecurrentOrder(ctx, {
        data: { ...insertData, customerId },
      });

      // const { id: recurrentOrderTemplateId } = recurrentOrderTemplate;
      const { id: recurrentOrderTemplateId } = { id: recurrentOrderTemplate.id };

      if (!isEmpty(lineItems)) {
        // pre-pricing service refactor code:
        // await RecurrentLineItemRepo.getInstance(this.ctxState).insertMany(
        //   {
        //     data: lineItems.map(item => Object.assign(item, { recurrentOrderTemplateId })),
        //     fields: ['id'],
        // await RecurrentLineItemRepo.getInstance(this.ctxState).insertMany(
        //   {
        //     data: lineItems.map((item) => Object.assign(item, { recurrentOrderTemplateId })),
        //     fields: ['id'],
        //   },
        //   trx,
        // );
        await pricingAddRecurrentOrderTemplateLineItems(ctx, {
          data: {
            data: lineItems.map(item => Object.assign(item, { recurrentOrderTemplateId })),
          },
        });
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: recurrentOrderTemplate.id, action: this.logAction.create });

    return recurrentOrderTemplate;
  }

  async updateOne(
    { condition: { id }, data: rawData, fields = ['*'], concurrentData, log } = {},
    trx,
  ) {
    const _trx = trx || (await this.knex.transaction());
    let recurrentTemplate;

    try {
      const prevServiceId = (await super.getById({ id, fields: ['billableServiceId'] }, trx))
        ?.billableServiceId;

      if ('billableServiceId' in rawData && rawData.billableServiceId !== prevServiceId) {
        rawData.equipmentItemId = (
          await BillableServiceRepo.getInstance(this.ctxState).getById(
            {
              id: rawData.billableServiceId,
              fields: ['equipmentItemId'],
            },
            trx,
          )
        )?.equipmentItemId;
      }

      const data = await this.prepHistoricalAndComputedFields(rawData, id, trx);

      const { lineItems = [] } = data;
      delete data.lineItems;

      recurrentTemplate = await super.updateBy(
        {
          condition: { id },
          data,
          fields: ['id'].concat(fields),
          concurrentData,
        },
        _trx,
      );

      if (recurrentTemplate) {
        await RecurrentLineItemRepo.getInstance(this.ctxState).upsertItems(
          {
            data: lineItems,
            condition: { recurrentOrderTemplateId: id },
            fields: [],
          },
          _trx,
        );
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

    return recurrentTemplate;
  }

  async closeOne({ condition: { id }, concurrentData, log }) {
    await super.updateBy({
      condition: { id },
      data: {
        status: RECURRENT_TEMPLATE_STATUS.closed,
      },
      concurrentData,
    });

    log && this.log({ id, action: this.logAction.modify });
  }

  async updateFailureDateByOrderId({ condition: { orderId }, log }) {
    const trx = await this.knex.transaction();

    let data;
    try {
      data = await RecurrentOrderTemplateOrderRepo.getInstance(
        this.ctxState,
      ).getRecurrentTemplateByOrderId(
        {
          condition: { orderId },
        },
        trx,
      );

      await super.updateBy(
        {
          condition: {
            id: data.recurrentOrderTemplateId,
          },
          data: {
            lastFailureDate: data.createdAt,
          },
        },
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    log && this.log({ id: data.recurrentOrderTemplateId, action: this.logAction.modify });
  }

  async getRecurrentOrderTemplatesToGenerate({
    condition: { date, businessUnitIds },
    fields = ['id', 'customer', 'nextServiceDate'],
  }) {
    const items = await this.populateDataQuery(fields)
      .whereIn(`${this.tableName}.businessUnitId`, businessUnitIds)
      .andWhere(`${this.tableName}.status`, RECURRENT_TEMPLATE_STATUS.active)
      .andWhere('syncDate', '!=', date.toUTCString())
      .andWhere(builder => builder.whereNull('endDate').orWhere('endDate', '>', date.toUTCString()))
      .andWhere({ nextServiceDate: addDays(date, 1).toUTCString() });

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getDataForGeneration(
    { condition: { recurrentOrderTemplateId } },
    { skipPricesRefresh = false } = {},
    ctx,
  ) {
    const trx = await this.knex.transaction();

    // const customersHt = CustomerRepo.getHistoricalTableName();
    let recurrentOrderTemplate;
    let pricesUpdateData = {};
    let lineItemsUpdateData = [];

    try {
      // pre-pricing service refactor code:
      // recurrentOrderTemplate = await trx(this.tableName)
      //   .withSchema(this.schemaName)
      //   .select([
      //     `${this.tableName}.*`,
      //     trx.raw('json_agg(??.*) as ??', [RecurrentLineItemRepo.TABLE_NAME, 'lineItems']),
      //     trx.raw('to_json(??.*) as ??', [customersHt, 'originalCustomer']),
      //   ])
      //   .where(unambiguousCondition(this.tableName, { id: recurrentOrderTemplateId }))
      //   .leftJoin(
      //     RecurrentLineItemRepo.TABLE_NAME,
      //     `${RecurrentLineItemRepo.TABLE_NAME}.recurrentOrderTemplateId`,
      //     `${this.tableName}.id`,
      //   )
      //   .innerJoin(customersHt, `${customersHt}.id`, `${this.tableName}.customerId`)
      //   .groupBy([`${this.tableName}.id`, `${customersHt}.id`])
      //   .orderBy(`${this.tableName}.id`)
      //   .first();
      // pre-pricing service refactor code end
      recurrentOrderTemplate = await pricingGetDataForGeneration(ctx, {
        data: { id: recurrentOrderTemplateId },
      });
      const customer = await CustomerRepo.getHistoricalInstance(this.ctxState).getBy({
        condition: { id: recurrentOrderTemplate.customerId },
      });

      recurrentOrderTemplate.originalCustomer = customer;

      // recurrentOrderTemplate = await trx(this.tableName)
      //   .withSchema(this.schemaName)
      //   .select([
      //     `${this.tableName}.*`,
      //     trx.raw('json_agg(??.*) as ??', [RecurrentLineItemRepo.TABLE_NAME, 'lineItems']),
      //     trx.raw('to_json(??.*) as ??', [customersHt, 'originalCustomer']),
      //   ])
      //   .where(unambiguousCondition(this.tableName, { id: recurrentOrderTemplateId }))
      //   .leftJoin(RecurrentLineItemRepo.TABLE_NAME, `${RecurrentLineItemRepo.TABLE_NAME}.recurrentOrderTemplateId`,
      //   `${this.tableName}.id`)
      //   .innerJoin(customersHt, `${customersHt}.id`, `${this.tableName}.customerId`)
      //   .groupBy([`${this.tableName}.id`, `${customersHt}.id`])
      //   .orderBy(`${this.tableName}.id`)
      //   .first();

      if (!recurrentOrderTemplate) {
        throw ApiError.notFound(`Recurrent order with id ${recurrentOrderTemplateId} not found`);
      }

      recurrentOrderTemplate = this.mapFields(recurrentOrderTemplate);

      if (recurrentOrderTemplate.lineItems[0] === null) {
        recurrentOrderTemplate.lineItems = [];
      } else {
        recurrentOrderTemplate.lineItems = recurrentOrderTemplate.lineItems.map(this.mapFields);
      }

      if (!recurrentOrderTemplate.unlockOverrides && !skipPricesRefresh) {
        // pre-pricing service refactor code:
        // note: both lines commented below arent needed just one...
        // const newestRates = await getNewestRatesForRecurrentOrderTemplate(
        //   { recurrentOrderTemplateId },
        // const newestRates = await getNewestRatesForRecurrentOrderTemplate({ recurrentOrderTemplateId }, this.ctxState, trx);
        const newestRates = await getNewestRatesForRecurrentOrderTemplatePricing(
          recurrentOrderTemplate,
          this.ctxState,
          trx,
        );

        if (newestRates) {
          ({ pricesUpdateData, lineItemsUpdateData } = newestRates);
        }
      }

      await trx.commit();
    } catch (error) {
      this.ctxState.logger.error(error);
      await trx.rollback();
      throw error;
    }

    return { recurrentOrderTemplate, pricesUpdateData, lineItemsUpdateData };
  }

  async holdCustomerRecurrentOrderTemplates(
    { condition = {}, status, onHoldNotifySalesRep, onHoldNotifyMainContact, log } = {},
    trx = this.knex,
  ) {
    const { customerId, status: conditionStatus } = condition;

    const customersHT = CustomerRepo.getHistoricalTableName();

    const data = {
      status,
      onHoldNotifySalesRep,
      onHoldNotifyMainContact,
    };

    if (status === RECURRENT_TEMPLATE_STATUS.active) {
      data.onHoldEmailSent = false;
      data.onHoldNotifyMainContact = false;
      data.onHoldNotifySalesRep = false;
    }

    const templates = await trx(this.tableName)
      .withSchema(this.schemaName)
      .innerJoin(customersHT, `${customersHT}.id`, `${this.tableName}.customerId`)
      .andWhere(`${customersHT}.originalId`, customerId)
      .andWhere(`${this.tableName}.status`, conditionStatus)
      .select([`${this.tableName}.id`]);
    if (templates?.length) {
      await Promise.all(
        templates.map(({ id }) =>
          this.updateBy(
            {
              condition: { id },
              data,
            },
            trx,
          ),
        ),
      );
    }

    if (templates?.length && log) {
      const action = this.logAction.modify;
      templates.forEach(({ id }) => this.log({ id, action }), this);
    }
  }

  async updateOneBeforeGeneration({
    condition: { id },
    data: { nextServiceDate, syncDate, pricesUpdateData = {}, lineItemsUpdateData = [] },
    log,
  }) {
    const trx = await this.knex.transaction();

    const recurrentLineItemRepo = RecurrentLineItemRepo.getInstance(this.ctxState);

    try {
      await Promise.all([
        this.updateBy(
          {
            condition: { id },
            data: {
              nextServiceDate,
              syncDate,
              ...pricesUpdateData,
            },
          },
          trx,
        ),
        ...lineItemsUpdateData.map(data =>
          recurrentLineItemRepo.updateBy({ condition: { id: data.id }, data }, trx),
        ),
      ]);

      await trx.commit();
    } catch (error) {
      await trx.rollback();

      throw error;
    }

    log && this.log({ id, action: this.logAction.modify });
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy(
      {
        condition: { id },
        fields: [
          'id',
          'status',
          'nextServiceDate',
          'lastFailureDate',
          ...nonLinkedInputFields,
          ...linkedInputFields,
        ],
      },
      trx,
    );

    return item || null;
  }

  getRecurrentOrdersByStatus(
    {
      customerId,
      statuses = [],
      fields = RecurrentOrderTemplateRepository.getRecurrentOrderTemplateGridFields(),
    },
    trx = this.knex,
  ) {
    return this.populateDataQuery(fields, trx)
      .andWhere({
        [`${CustomerRepo.getHistoricalTableName()}.originalId`]: customerId,
      })
      .whereIn(`${this.tableName}.status`, statuses);
  }

  async getOrderToNotifyHold({ fields = ['*'] }) {
    const customerHT = CustomerRepo.getHistoricalTableName();
    const customerTable = CustomerRepo.TABLE_NAME;
    const contactTable = ContactRepository.TABLE_NAME;
    const customerGroupTable = CustomerGroupRepository.TABLE_NAME;
    const selects = [
      ...unambiguousSelect(this.tableName, fields),
      ...unambiguousSelect(customerTable, [
        'salesId',
        'contactId',
        'email',
        'firstName',
        'lastName',
      ]),
      `${customerTable}.id as customerId`,
      `${contactTable}.email as mainEmail`,
      `${contactTable}.firstName as mainFirstName`,
      `${contactTable}.lastName as mainLastName`,
      `${customerGroupTable}.type as customerType`,
    ];

    const result = await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .where({ onHoldEmailSent: false })
      .andWhere(qb => {
        qb.whereNotNull(`${customerTable}.salesId`)
          .andWhere(`${this.tableName}.onHoldNotifySalesRep`, true)
          .orWhere(`${this.tableName}.onHoldNotifyMainContact`, true);
      })
      .select(selects)
      .innerJoin(customerHT, `${customerHT}.id`, `${this.tableName}.customerId`)
      .innerJoin(customerTable, `${customerTable}.id`, `${customerHT}.originalId`)
      .innerJoin(contactTable, `${customerTable}.contactId`, `${contactTable}.id`)
      .innerJoin(
        customerGroupTable,
        `${customerTable}.customerGroupId`,
        `${customerGroupTable}.id`,
      );

    return result;
  }

  async setOrderHoldSent(orderIds) {
    await this.knex(this.tableName)
      .withSchema(this.schemaName)
      .update({ onHoldEmailSent: true })
      .whereIn(`${this.tableName}.id`, orderIds);
  }
}

RecurrentOrderTemplateRepository.TABLE_NAME = TABLE_NAME;

export default RecurrentOrderTemplateRepository;
