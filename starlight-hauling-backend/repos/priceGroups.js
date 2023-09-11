import compose from 'lodash/fp/compose.js';
import compact from 'lodash/compact.js';
import omit from 'lodash/omit.js';
import isEmpty from 'lodash/isEmpty.js';
import without from 'lodash/without.js';
import { startOfDay, format } from 'date-fns';

import ApiError from '../errors/ApiError.js';
import { BATCH_RATES_APPLICATION, APPLICATION_TO_LINKED_FIELDS } from '../consts/batchRates.js';
import { EVENT_TYPE } from '../consts/historicalEventType.js';
import {
  priceGroupFields,
  linkedFields as priceGroupLinkedFields,
  PRICE_GROUP_TYPE,
} from '../consts/priceGroupFields.js';
import fieldToLinkedTableMap from '../consts/fieldToLinkedTableMap.js';
import { DATE_FORMAT_ISO } from '../consts/formats.js';
import { unambiguousCondition, unambiguousSelect, camelCaseKeys } from '../utils/dbHelpers.js';
import BaseRepository from './_base.js';
import CustomerRepository from './customer.js';
import CustomerJobSitePairRepository from './customerJobSitePair.js';
import CustomerGroupRepository from './customerGroup.js';
import JobSiteRepository from './jobSite.js';
import ServiceAreaRepository from './serviceArea.js';
import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'price_groups';

class PriceGroupRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }

  async createOne({ data } = {}, trx = this.knex) {
    const insertData = this.prepareData(data);

    const result = await super.createOne({ data: insertData }, trx);

    return result;
  }

  async populateDataQuery(trx, { fields, pullSelects = false }) {
    let query = trx(this.tableName).withSchema(this.schemaName);

    const linkedData = [];
    const fieldsToExcludeForJoin = ['businessUnitId', 'businessLineId'];

    fields
      .filter(field => !fieldsToExcludeForJoin.includes(field))
      .forEach(field => field.endsWith('Id') && linkedData.push(field));

    const selects = fields.map(field => `${this.tableName}.${field}`);

    for (const field of linkedData) {
      const jtName = fieldToLinkedTableMap[field];
      const alias = field.slice(0, -2);

      const joinedTableColumns = await BaseRepository.getColumnsToSelect({
        alias,
        tableName: jtName,
        schemaName: this.schemaName,
      });

      selects.push(...joinedTableColumns);
      query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.${field}`);
    }

    if (fields.includes('customerJobSiteId')) {
      const customerColumnsToSelect = await CustomerRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('customer');
      const jobSiteColumnsToSelect = await JobSiteRepository.getInstance(
        this.ctxState,
      ).getColumnsToSelect('jobSite');
      selects.push(...customerColumnsToSelect, ...jobSiteColumnsToSelect);

      const customerAndJobSite = ['customerJobSiteId', 'customerId'].every(field =>
        fields.includes(field),
      );

      if (customerAndJobSite) {
        query = query
          .leftJoin(
            JobSiteRepository.TABLE_NAME,
            `${CustomerJobSitePairRepository.TABLE_NAME}.jobSiteId`,
            `${JobSiteRepository.TABLE_NAME}.id`,
          )
          .leftJoin(
            `${CustomerRepository.TABLE_NAME} as cjc`,
            `${CustomerJobSitePairRepository.TABLE_NAME}.customerId`,
            `cjc.id`,
          );
      } else {
        query = query
          .innerJoin(
            JobSiteRepository.TABLE_NAME,
            `${CustomerJobSitePairRepository.TABLE_NAME}.jobSiteId`,
            `${JobSiteRepository.TABLE_NAME}.id`,
          )
          .innerJoin(
            CustomerRepository.TABLE_NAME,
            `${CustomerJobSitePairRepository.TABLE_NAME}.customerId`,
            `${CustomerRepository.TABLE_NAME}.id`,
          );
      }
    }

    if (fields.includes('serviceAreasIds')) {
      const serviceAreaTable = ServiceAreaRepository.TABLE_NAME;
      query = query.leftJoin(`${serviceAreaTable} as sa`, qb => {
        qb.on(`sa.id`, '=', trx.raw('ANY(??)', [`${this.tableName}.serviceAreasIds`]));
      });
    }

    return pullSelects ? { query, selects } : { query: query.select(...selects) };
  }

  async getPriceGroupType({ id }, trx = this.knex) {
    const priceGroup = await this.getById({ id, fields: ['id', ...priceGroupLinkedFields] }, trx);

    if (priceGroup.customerId) {
      return PRICE_GROUP_TYPE.customer;
    }

    if (priceGroup.customerGroupId) {
      return PRICE_GROUP_TYPE.customerGroup;
    }

    if (priceGroup.customerJobSiteId) {
      return PRICE_GROUP_TYPE.customerJobSite;
    }

    if (priceGroup.serviceAreasIds.length) {
      return PRICE_GROUP_TYPE.serviceArea;
    }

    return null;
  }

  async getAllByIds({ ids, fields = ['*'], joinedFields = [], isPreview }, trx = this.knex) {
    const selects = [...unambiguousSelect(this.tableName, fields)];

    let { query } = await this.populateDataQuery(trx, { fields: joinedFields, pullSelects: true });

    if (isPreview) {
      selects.push(
        `${this.tableName}.description as priceGroupDescription`,
        `${JobSiteRepository.TABLE_NAME}.fullAddress`,
        trx.raw(
          `coalesce(
            ${CustomerRepository.TABLE_NAME}.name,
            ${CustomerGroupRepository.TABLE_NAME}.description,
            cjc.name,
            string_agg(sa.description, ', ')) as hint`,
        ),
      );

      query = query.groupBy([
        `${this.tableName}.id`,
        `${JobSiteRepository.TABLE_NAME}.fullAddress`,
        `${CustomerRepository.TABLE_NAME}.name`,
        `${CustomerGroupRepository.TABLE_NAME}.description`,
        'cjc.name',
      ]);
    }

    query = query.whereIn(`${this.tableName}.id`, ids).select(selects);

    return query;
  }

  getFieldsToSelectBasedOnType(type) {
    const fieldsWithoutLinkedItems = without(priceGroupFields, ...priceGroupLinkedFields);

    switch (type) {
      case PRICE_GROUP_TYPE.customerGroup: {
        fieldsWithoutLinkedItems.push('customerGroupId');
        break;
      }
      case PRICE_GROUP_TYPE.customer: {
        fieldsWithoutLinkedItems.push('customerId');
        break;
      }
      case PRICE_GROUP_TYPE.customerJobSite: {
        fieldsWithoutLinkedItems.push('customerJobSiteId');
        break;
      }
      case PRICE_GROUP_TYPE.serviceArea: {
        fieldsWithoutLinkedItems.push('serviceAreasIds');
        break;
      }
      default:
        break;
    }

    return fieldsWithoutLinkedItems;
  }

  async getByIdPopulated({ id }, trx = this.knex) {
    const type = await this.getPriceGroupType({ id }, trx);
    const select = this.getFieldsToSelectBasedOnType(type);

    let { query } = await this.populateDataQuery(trx, { fields: select });

    query = query.where(unambiguousCondition(this.tableName, { id })).first();

    let result = await query;

    if (result && result.serviceAreasIds?.length) {
      [result] = await this.joinAndMapServiceAreas([result], trx);
    }

    return !isEmpty(result) ? compose(super.mapJoinedFields, this.mapFields)(result) : null;
  }

  async getCustomFilteredAndPaginated(
    { condition = {}, serviceAreasIds, type, skip = 0, limit = 25, orderBy = [] } = {},
    trx = this.knex,
  ) {
    const select = this.getFieldsToSelectBasedOnType(type);

    let { query } = await this.populateDataQuery(trx, { fields: select });

    query = query
      .limit(limit)
      .offset(skip)
      .where(unambiguousCondition(this.tableName, condition))
      .orderBy(orderBy);

    if (serviceAreasIds?.length) {
      query = query.andWhereRaw(`? <@ ${this.tableName}.service_areas_ids`, [serviceAreasIds]);
    }

    switch (type) {
      case PRICE_GROUP_TYPE.customerGroup: {
        query = query.whereNotNull(`${this.tableName}.customerGroupId`);
        break;
      }
      case PRICE_GROUP_TYPE.customer: {
        query = query.whereNotNull(`${this.tableName}.customerId`);
        break;
      }
      case PRICE_GROUP_TYPE.customerJobSite: {
        query = query.whereNotNull(`${this.tableName}.customerJobSiteId`);
        break;
      }
      case PRICE_GROUP_TYPE.serviceArea: {
        query = query.whereRaw(`array_length(${this.tableName}.service_areas_ids, 1) > 0`);
        break;
      }
      default:
        break;
    }

    let result = await query;

    if (type === PRICE_GROUP_TYPE.serviceArea && result?.length) {
      result = await this.joinAndMapServiceAreas(result, trx);
    }

    return result?.length
      ? result.map(item => compose(super.mapJoinedFields, this.mapFields)(item))
      : null;
  }

  async joinAndMapServiceAreas(priceGroups = [], trx) {
    const uniqueServiceAreasIds = [...new Set(priceGroups?.flatMap(item => item.serviceAreasIds))];

    const serviceAreas = await ServiceAreaRepository.getInstance(this.ctxState).getAllByIds(
      { ids: uniqueServiceAreasIds },
      trx,
    );

    const result = priceGroups?.map(item => {
      const { serviceAreasIds, ...rest } = item;
      return {
        ...rest,
        serviceAreasIds,
        serviceAreas:
          serviceAreas?.filter(serviceArea => item.serviceAreasIds?.includes(serviceArea.id)) ?? [],
      };
    });

    return result;
  }

  getRatesByApplication(
    { condition: { businessLineId, businessUnitId, application, applyTo }, fields = ['*'] },
    trx = this.knex,
  ) {
    let query = super.getAll(
      {
        condition: { businessLineId, businessUnitId },
        fields,
      },
      trx,
    );

    if (application === BATCH_RATES_APPLICATION.specificPriceGroups) {
      query = query.whereIn(`${this.tableName}.id`, applyTo);
    }

    if (application === BATCH_RATES_APPLICATION.serviceAreas) {
      query = query.whereRaw('?? @> ?', [`${this.tableName}.serviceAreasIds`, applyTo]);
    }

    if (Object.keys(APPLICATION_TO_LINKED_FIELDS).includes(application)) {
      query = query.whereIn(APPLICATION_TO_LINKED_FIELDS[application], applyTo);
    }

    return query;
  }

  async getLinkedPriceGroups({ condition }, trx = this.knex) {
    const customerJobSiteTable = CustomerJobSitePairRepository.TABLE_NAME;
    const customerTable = CustomerRepository.TABLE_NAME;
    const jobSiteTable = JobSiteRepository.TABLE_NAME;
    const serviceAreaTable = ServiceAreaRepository.TABLE_NAME;

    const result = await this.knex(`${this.schemaName}.${this.tableName}`)
      .select(
        trx.raw('json_agg(DISTINCT ??.*) as ??', ['customers', 'customers']),
        trx.raw('json_agg(DISTINCT cjs.*) as ??', ['customerJobSites']),
        trx.raw('json_agg(DISTINCT ??.*) as ??', ['customerGroups', 'customerGroups']),
        trx.raw('json_agg(DISTINCT ??.*) as ??', ['serviceAreas', 'serviceAreas']),
      )
      .leftJoin(`${this.schemaName}.customers`, 'customers.id', `${this.tableName}.customerId`)
      .leftJoin(`${this.schemaName}.serviceAreas`, qb => {
        qb.on(
          `${serviceAreaTable}.id`,
          '=',
          trx.raw('ANY(??)', [`${this.tableName}.serviceAreasIds`]),
        );
      })
      .leftJoin(
        trx(customerJobSiteTable)
          .withSchema(this.schemaName)
          .select(
            `${customerJobSiteTable}.*`,
            trx.raw('jsonb_agg(??.*) as ??', [customerTable, 'customer']),
            trx.raw('jsonb_agg(??.*) as ??', [jobSiteTable, 'jobSite']),
          )
          .leftJoin(customerTable, `${customerTable}.id`, `${customerJobSiteTable}.customerId`)
          .leftJoin(jobSiteTable, `${jobSiteTable}.id`, `${customerJobSiteTable}.jobSiteId`)
          .groupBy(`${customerJobSiteTable}.id`)
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

    const csRepo = CustomerRepository.getInstance(this.ctxState);
    result.customers = result.customers.map(customer => csRepo.mapFields(customer, false));

    const cgRepo = CustomerGroupRepository.getInstance(this.ctxState);
    result.customerGroups = result.customerGroups.map(cgRepo.mapFields.bind(this));

    const cjsRepo = CustomerJobSitePairRepository.getInstance(this.ctxState);
    const jsRepo = JobSiteRepository.getInstance(this.ctxState);

    result.serviceAreas = result.serviceAreas.map(camelCaseKeys);

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

  async updateBy(
    { condition, data, fields = ['*'], whereIn, eventType = EVENT_TYPE.edited, log } = {},
    trx,
    { noRecord = false, skipEmpty = false } = {},
  ) {
    let obj;
    const _trx = trx || (await this.knex.transaction());

    const updatedData = omit(this.prepareData(data), ['user']);

    try {
      let query = _trx(this.tableName)
        .withSchema(this.schemaName)
        .update(updatedData, log ? '*' : fields)
        .where(condition);

      if (whereIn?.length) {
        whereIn.forEach(({ key, values }) => {
          query = query.whereIn(key, values);
        });
      }

      const items = await query;
      if (!items?.[0]) {
        return null;
      }

      log &&
        items?.length &&
        Promise.all(items.map(item => this.log({ id: item.id, action: this.logAction.modify })));

      [obj] = items;

      if (obj) {
        if (!noRecord) {
          await this.makeHistoricalRecord(
            {
              data: {
                ...this.constructor.filterOutTechFields(obj),
                ...(data.user && { user: data.user }),
              },
              originalId: obj.id,
              eventType,
            },
            _trx,
          );
        }
      } else if (!skipEmpty) {
        throw ApiError.notFound(
          'No such entity',
          `No entity (${this.tableName}) with ${JSON.stringify(condition)}`,
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

    log && this.log({ id: obj.id, action: this.logAction.modify });

    return VersionedRepository.getFields(obj, fields);
  }

  prepareData = data => {
    const { startAt, ...restData } = data;

    const newStartAt = startAt && format(startOfDay(startAt), DATE_FORMAT_ISO);

    return { ...restData, startAt: newStartAt };
  };
}

PriceGroupRepository.TABLE_NAME = TABLE_NAME;

export default PriceGroupRepository;
