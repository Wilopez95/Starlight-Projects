import map from 'lodash/fp/map.js';
import flatMap from 'lodash/fp/flatMap.js';
import isEmpty from 'lodash/isEmpty.js';
import camelCase from 'lodash/fp/camelCase.js';
import mapKeys from 'lodash/fp/mapKeys.js';
import pick from 'lodash/pick.js';

import { toBbox, fromBbox } from '../utils/postgis.js';
import { unambiguousCondition } from '../utils/dbHelpers.js';
import { TAX_KIND } from '../consts/taxDistricts.js';
import { DISTRICT_TYPE } from '../consts/districtTypes.js';
import ApiError from '../errors/ApiError.js';
import VersionedRepository from './_versioned.js';
import TaxDistrictCustomerJobSiteRepository from './taxDistrictCustomerJobSite.js';
import JobSiteRepository from './jobSite.js';
import BusinessLineRepository from './businessLine.js';
import OrderRepository from './order.js';
import OrderTaxDistrictTaxesRepository from './orderTaxDistrictTaxes.js';
import OrderTaxDistrictRepository from './orderTaxDistrict.js';

const TABLE_NAME = 'tax_districts';
const taxesTableName = 'tax_district_taxes';
const taxesOnBusinessLineTableName = 'tax_districts_business_line_taxes';
const materialExclusionsTableName = 'tax_district_group_taxes_material_exclusions';
const serviceExclusionsTableName = 'tax_district_group_taxes_service_exclusions';
const recurringServiceExclusionsTableName = 'tax_district_group_taxes_recurring_service_exclusions';
const lineItemExclusionTableName = 'tax_district_group_taxes_line_item_exclusions';
const recurringLineItemExclusionTableName =
  'tax_district_group_taxes_recurring_line_item_exclusions';
const nonGroupMaterialTaxesTableName = 'tax_district_non_group_material_taxes';
const nonGroupServiceTaxesTableName = 'tax_district_non_group_service_taxes';
const nonGroupRecurringServiceTaxesTableName = 'tax_district_non_group_recurring_service_taxes';
const nonGroupLineItemTaxesTableName = 'tax_district_non_group_line_item_taxes';
const nonGroupRecurringLineItemTaxesTableName = 'tax_district_non_group_recurring_line_item_taxes';

const pluckIdAndFlatten = flatMap(map('id'));
const pluckId = map('id');

const defaultTaxes = {
  group: true,
  value: '0',
  calculation: 'percentage',
  exclusions: [],
};

const getIdField = (key, commercial) => {
  let idField;
  switch (key) {
    case TAX_KIND.materials:
      idField = 'material_taxes_id';
      break;
    case TAX_KIND.lineItems:
      idField = 'line_item_taxes_id';
      break;
    case TAX_KIND.recurringLineItems:
      idField = 'recurring_line_item_taxes_id';
      break;
    case TAX_KIND.services:
      idField = 'service_taxes_id';
      break;
    case TAX_KIND.recurringServices:
      idField = 'recurring_service_taxes_id';
      break;
    default:
      throw new TypeError('Invalid key for taxes id');
  }

  return `${commercial ? 'commercial_' : 'non_commercial_'}${idField}`;
};

const getLinkedItemIdField = key => `${key.slice(0, -1)}Id`;

const getExclusionsTableName = key => {
  switch (key) {
    case TAX_KIND.materials:
      return materialExclusionsTableName;
    case TAX_KIND.lineItems:
      return lineItemExclusionTableName;
    case TAX_KIND.recurringLineItems:
      return recurringLineItemExclusionTableName;
    case TAX_KIND.services:
      return serviceExclusionsTableName;
    case TAX_KIND.recurringServices:
      return recurringServiceExclusionsTableName;
    default:
      throw new TypeError('Invalid key for taxes id');
  }
};

const getNonGroupTaxesTableName = key => {
  switch (key) {
    case TAX_KIND.materials:
      return nonGroupMaterialTaxesTableName;
    case TAX_KIND.lineItems:
      return nonGroupLineItemTaxesTableName;
    case TAX_KIND.recurringLineItems:
      return nonGroupRecurringLineItemTaxesTableName;
    case TAX_KIND.services:
      return nonGroupServiceTaxesTableName;
    case TAX_KIND.recurringServices:
      return nonGroupRecurringServiceTaxesTableName;
    default:
      throw new TypeError('Invalid key for taxes id');
  }
};

class TaxDistrictRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  // TODO: rename to `getWithTaxes`
  async getBy({ condition, fields = ['*'], orderBy = ['description'] }, trx = this.knex) {
    const selects = [
      `${fields.map(f => `td.${f}`).join(', ')}`,
      'array_agg(business_configuration.conf) business_configuration',
    ];

    // `bbox` is a `box2d` column which must be handled by PostGIS
    const bboxIndex = fields.indexOf('bbox');
    if (fields.includes('*') || bboxIndex !== -1) {
      if (bboxIndex !== -1) {
        fields.splice(bboxIndex, 1);
      }

      selects.push(fromBbox(trx, 'bbox'));
    }

    const selectClause = trx.raw(selects.join(', '));

    const taxDistrictsBusinessLineTaxesSelect = [
      `tbld.business_line_id`,
      `tbld.id`,
      'row_to_json(cm.*) as commercial_materials',
      'row_to_json(cs.*) as commercial_services',
      'row_to_json(crs.*) as commercial_recurring_services',
      'row_to_json(cli.*) as commercial_line_items',
      'row_to_json(crli.*) as commercial_recurring_line_items',
      'row_to_json(ncm.*) as non_commercial_materials',
      'row_to_json(ncs.*) as non_commercial_services',
      'row_to_json(ncrs.*) as non_commercial_recurring_services',
      'row_to_json(ncli.*) as non_commercial_line_items',
      'row_to_json(ncrli.*) as non_commercial_recurring_line_items',
    ];

    const taxDistrictsBusinessLineTaxesTable = trx(`${taxesOnBusinessLineTableName} as tbld`)
      .withSchema(this.schemaName)
      .select(trx.raw(taxDistrictsBusinessLineTaxesSelect.join(', ')))
      .innerJoin(`${taxesTableName} as cs`, 'cs.id', 'tbld.commercial_service_taxes_id')
      .innerJoin(`${taxesTableName} as crs`, 'crs.id', 'tbld.commercial_recurring_service_taxes_id')
      .innerJoin(`${taxesTableName} as cm`, 'cm.id', 'tbld.commercial_material_taxes_id')
      .innerJoin(`${taxesTableName} as cli`, 'cli.id', 'tbld.commercial_line_item_taxes_id')
      .innerJoin(
        `${taxesTableName} as crli`,
        'crli.id',
        'tbld.commercial_recurring_line_item_taxes_id',
      )
      .innerJoin(`${taxesTableName} as ncs`, 'ncs.id', 'tbld.non_commercial_service_taxes_id')
      .innerJoin(
        `${taxesTableName} as ncrs`,
        'ncrs.id',
        'tbld.non_commercial_recurring_service_taxes_id',
      )
      .innerJoin(`${taxesTableName} as ncm`, 'ncm.id', 'tbld.non_commercial_material_taxes_id')
      .innerJoin(`${taxesTableName} as ncli`, 'ncli.id', 'tbld.non_commercial_line_item_taxes_id')
      .innerJoin(
        `${taxesTableName} as ncrli`,
        'ncrli.id',
        'tbld.non_commercial_recurring_line_item_taxes_id',
      );

    const grouped = trx({ jsonConfiguration: taxDistrictsBusinessLineTaxesTable })
      .select('jsonConfiguration.id', trx.raw('row_to_json(json_configuration.*) conf'))
      .as('business_configuration');

    let query = trx(`${this.tableName} as td`)
      .withSchema(this.schemaName)
      .select(selectClause)
      .innerJoin(
        grouped,
        'business_configuration.id',
        trx.raw('ANY(??)', ['td.business_line_taxes_ids']),
      )
      .groupBy('td.id')
      .orderBy(orderBy);

    if (condition.ids) {
      const { ids } = condition;
      delete condition.ids;
      query = query.whereIn('td.id', ids);
    }

    if (condition) {
      query = query.where(unambiguousCondition('td', condition));
    }

    const taxes = await query;

    if (!taxes) {
      return [];
    }

    const getTaxExclusionsOrNonGroupItems = async ({ kind, config, taxItemFields = [] }) => {
      let items;

      if (config.group) {
        config.value = String(config.value);

        items = await trx(getExclusionsTableName(kind))
          .withSchema(this.schemaName)
          .select(taxItemFields)
          .where('tax_district_taxes_id', config.id);
      } else {
        items = await trx(getNonGroupTaxesTableName(kind))
          .withSchema(this.schemaName)
          .select(taxItemFields.concat(trx.raw('value::text')))
          .where('tax_district_taxes_id', config.id);
      }

      const lineItems = [];
      const thresholds = [];

      config.id = undefined;

      if (kind === TAX_KIND.lineItems) {
        items?.forEach(tax => (tax.thresholdId ? thresholds.push(tax) : lineItems.push(tax)));

        if (config.group) {
          config.exclusions = {
            thresholds: map('thresholdId')(thresholds),
            lineItems: map('lineItemId')(lineItems),
          };
        } else {
          config.nonGroup = {
            thresholds: thresholds.map(threshold => ({
              id: threshold.thresholdId,
              value: threshold.value,
            })),
            lineItems: lineItems.map(lineItem => ({
              id: lineItem.lineItemId,
              value: lineItem.value,
            })),
          };
        }
      } else if (config.group) {
        config.exclusions = pluckId(items);
      } else {
        config.nonGroup = items || [];
      }
    };

    await Promise.all(
      taxes.map(tax => {
        tax.businessConfiguration = tax.businessConfiguration?.map(conf =>
          mapKeys(camelCase)(conf),
        );

        return Promise.all(
          tax?.businessConfiguration?.flatMap(config => {
            const getTaxExclusionsOrNonGroupItemsParams = [
              {
                kind: TAX_KIND.materials,
                config: config.commercialMaterials,
                taxItemFields: ['material_id as id'],
              },
              {
                kind: TAX_KIND.services,
                config: config.commercialServices,
                taxItemFields: ['service_id as id'],
              },
              {
                kind: TAX_KIND.recurringServices,
                config: config.commercialRecurringServices,
                taxItemFields: ['recurring_service_id as id'],
              },
              {
                kind: TAX_KIND.lineItems,
                config: config.commercialLineItems,
                taxItemFields: ['line_item_id', 'threshold_id'],
              },
              {
                kind: TAX_KIND.recurringLineItems,
                config: config.commercialRecurringLineItems,
                taxItemFields: ['recurring_line_item_id as id'],
              },
              {
                kind: TAX_KIND.materials,
                config: config.nonCommercialMaterials,
                taxItemFields: ['material_id as id'],
              },
              {
                kind: TAX_KIND.services,
                config: config.nonCommercialServices,
                taxItemFields: ['service_id as id'],
              },
              {
                kind: TAX_KIND.recurringServices,
                config: config.nonCommercialRecurringServices,
                taxItemFields: ['recurring_service_id as id'],
              },
              {
                kind: TAX_KIND.lineItems,
                config: config.nonCommercialLineItems,
                taxItemFields: ['line_item_id', 'threshold_id'],
              },
              {
                kind: TAX_KIND.recurringLineItems,
                config: config.nonCommercialRecurringLineItems,
                taxItemFields: ['recurring_line_item_id as id'],
              },
            ];

            return Promise.all(
              getTaxExclusionsOrNonGroupItemsParams.map(params =>
                getTaxExclusionsOrNonGroupItems(params),
              ),
            );
          }),
        );
      }),
    );

    return taxes;
  }

  getAllWithTaxes({ condition = {}, fields = ['*'], orderBy = [] } = {}, trx = this.knex) {
    return super.getAll({ condition, fields: fields.concat(fromBbox(trx, 'bbox')), orderBy });
  }

  async initTaxesForNewBusinessLine({ condition: { businessLineId } }, trx = this.knex) {
    const taxes = await super.getAll(
      { condition: {}, fields: ['id', 'businessLineTaxesIds'] },
      trx,
    );

    if (isEmpty(taxes)) {
      return;
    }

    const taxBusinessLineConfigurationsIds = await Promise.all(
      taxes.flatMap(() =>
        this.initTaxesForBusinessLine(
          {
            condition: { businessLineId },
            fields: ['id'],
          },
          trx,
        ),
      ),
    );

    await Promise.all(
      taxBusinessLineConfigurationsIds.flat().map(({ id }, index) => {
        const tax = taxes[index];
        return this.updateBy(
          {
            condition: { id: tax.id },
            data: { businessLineTaxesIds: tax.businessLineTaxesIds.concat(id) },
            fields: ['id'],
          },
          trx,
        );
      }),
    );
  }

  async initTaxesForBusinessLine(
    { condition: { businessLineId }, fields = ['*'] },
    trx = this.knex,
  ) {
    const details = {
      commercialMaterials: defaultTaxes,
      commercialServices: defaultTaxes,
      commercialRecurringServices: defaultTaxes,
      commercialLineItems: defaultTaxes,
      commercialRecurringLineItems: defaultTaxes,
      nonCommercialMaterials: defaultTaxes,
      nonCommercialServices: defaultTaxes,
      nonCommercialRecurringServices: defaultTaxes,
      nonCommercialLineItems: defaultTaxes,
      nonCommercialRecurringLineItems: defaultTaxes,
    };

    const [
      commercialMaterialTaxesId,
      commercialServiceTaxesId,
      commercialRecurringServiceTaxesId,
      commercialLineItemTaxesId,
      commercialRecurringLineItemTaxesId,
      nonCommercialMaterialTaxesId,
      nonCommercialServiceTaxesId,
      nonCommercialRecurringServiceTaxesId,
      nonCommercialLineItemTaxesId,
      nonCommercialRecurringLineItemTaxesId,
    ] = pluckIdAndFlatten(
      await Promise.all(
        [
          // commercial defaults
          details.commercialMaterials,
          details.commercialServices,
          details.commercialRecurringServices,
          details.commercialLineItems,
          details.commercialRecurringLineItems,
          // non-commercial defaults
          details.nonCommercialMaterials,
          details.nonCommercialServices,
          details.nonCommercialRecurringServices,
          details.nonCommercialLineItems,
          details.nonCommercialRecurringLineItems,
        ].map(({ group, value, calculation }) =>
          trx(taxesTableName)
            .withSchema(this.schemaName)
            .insert({ group, value, calculation }, ['id']),
        ),
      ),
    );

    const [businessConfiguration] = await trx(taxesOnBusinessLineTableName)
      .withSchema(this.schemaName)
      .insert(
        {
          commercialMaterialTaxesId,
          commercialServiceTaxesId,
          commercialRecurringServiceTaxesId,
          commercialLineItemTaxesId,
          commercialRecurringLineItemTaxesId,
          nonCommercialMaterialTaxesId,
          nonCommercialServiceTaxesId,
          nonCommercialRecurringServiceTaxesId,
          nonCommercialLineItemTaxesId,
          nonCommercialRecurringLineItemTaxesId,
          businessLineId,
        },
        fields,
      );

    return Object.assign(businessConfiguration, details);
  }

  async createOne({ data, fields = ['*'], log } = {}) {
    let originalBbox = null;
    let details = {};

    if (data.districtType === DISTRICT_TYPE.country) {
      const district = await super.getBy({
        condition: { districtType: DISTRICT_TYPE.country },
        fields: ['id'],
      });

      if (district?.id) {
        throw ApiError.conflict('No more than one country level district can exist');
      }
    }

    const trx = await this.knex.transaction();

    try {
      if (data.bbox) {
        originalBbox = data.bbox;
        data.bbox = toBbox(trx, data.bbox);
      }

      const businessLineIds = await BusinessLineRepository.getInstance(this.ctxState).getAll(
        { fields: ['id as businessLineId'] },
        trx,
      );

      const businessConfiguration = await Promise.all(
        businessLineIds.flatMap(({ businessLineId }) =>
          this.initTaxesForBusinessLine(
            { condition: { businessLineId, taxDistrictId: details.id } },
            trx,
          ),
        ),
      );

      data.businessLineTaxesIds = pluckId(businessConfiguration);

      details = await super.createOne({ data, fields: log ? '*' : fields }, trx);

      details.businessConfiguration = businessConfiguration;

      // If this is a district without a map code, we are done.
      if (data.districtCode) {
        // Mark this task district as relevant for the included job sites
        const affectedJobSites = await JobSiteRepository.getInstance(
          this.ctxState,
        ).materializeVirtualTaxDistrict(
          {
            taxDistrictId: details.id,
            districtCode: data.districtCode,
          },
          trx,
        );

        if (!isEmpty(affectedJobSites)) {
          // Add this tax district to customer job site pairs
          await TaxDistrictCustomerJobSiteRepository.getInstance(
            this.ctxState,
          ).addMaterializedTaxDistrict({ taxDistrictId: details.id, affectedJobSites }, trx);
        }
      }

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    log && this.log({ id: details.id, action: this.logAction.create });

    return Object.assign(details, data, { bbox: originalBbox });
  }

  async updateTaxesDetails({ id: taxDistrictId, key, details, log }) {
    if (details.group && !details.exclusions) {
      details.exclusions = [];
    } else if (!details.group && !details.nonGroup) {
      details.nonGroup = [];
    }

    const trx = await this.knex.transaction();

    try {
      const { commercial, exclusions, nonGroup, businessLineId, ...taxes } = details;
      const [{ id: taxDistrictTaxesId } = {}] = await trx(taxesTableName)
        .withSchema(this.schemaName)
        .insert(taxes, ['id']);

      const itemIdField = getLinkedItemIdField(key);
      let rowsToInsert;

      if (taxes.group && key === TAX_KIND.lineItems) {
        rowsToInsert = exclusions.thresholds
          .map(thresholdId => ({ taxDistrictTaxesId, thresholdId }))
          .concat(
            exclusions.lineItems.map(lineItemId => ({
              taxDistrictTaxesId,
              lineItemId,
            })),
          );
      } else if (taxes.group) {
        rowsToInsert = exclusions.map(itemId => ({
          taxDistrictTaxesId,
          [itemIdField]: itemId,
        }));
      } else if (key === TAX_KIND.lineItems) {
        rowsToInsert = nonGroup.thresholds
          .map(({ id: thresholdId, value }) => ({
            value,
            taxDistrictTaxesId,
            thresholdId,
          }))
          .concat(
            nonGroup.lineItems.map(({ id: lineItemId, value }) => ({
              value,
              taxDistrictTaxesId,
              lineItemId,
            })),
          );
      } else {
        rowsToInsert = nonGroup.map(({ id: itemId, value }) => ({
          value,
          taxDistrictTaxesId,
          [itemIdField]: itemId,
        }));
      }

      const taxesField = getIdField(key, commercial);
      const table = taxes.group ? getExclusionsTableName(key) : getNonGroupTaxesTableName(key);

      const businessLinesTaxes = await this.getById({
        id: taxDistrictId,
        fields: ['businessLineTaxesIds'],
      });

      if (!businessLinesTaxes) {
        return null;
      }

      const { businessLineTaxesIds } = businessLinesTaxes;

      const [taxBusinessLineConfiguration] = await trx(taxesOnBusinessLineTableName)
        .withSchema(this.schemaName)
        .where({
          businessLineId,
        })
        .whereIn('id', businessLineTaxesIds);

      const insertTaxBusinessLine = {
        ...pick(taxBusinessLineConfiguration, [
          'commercialMaterialTaxesId',
          'commercialServiceTaxesId',
          'commercialRecurringServiceTaxesId',
          'commercialLineItemTaxesId',
          'commercialRecurringLineItemTaxesId',
          'nonCommercialMaterialTaxesId',
          'nonCommercialServiceTaxesId',
          'nonCommercialRecurringServiceTaxesId',
          'nonCommercialLineItemTaxesId',
          'nonCommercialRecurringLineItemTaxesId',
          'businessLineId',
        ]),
        [camelCase(taxesField)]: taxDistrictTaxesId,
      };

      const [[{ id: newConfigurationId }]] = await Promise.all([
        trx(taxesOnBusinessLineTableName)
          .withSchema(this.schemaName)
          .insert(insertTaxBusinessLine, ['id']),
        rowsToInsert &&
          rowsToInsert.length > 0 &&
          trx(table).withSchema(this.schemaName).insert(rowsToInsert),
      ]);

      const newBusinessLineTaxesIds = businessLineTaxesIds
        .filter(id => id !== taxBusinessLineConfiguration.id)
        .concat(newConfigurationId);

      await this.updateBy(
        {
          condition: { id: taxDistrictId },
          data: { businessLineTaxesIds: newBusinessLineTaxesIds },
          fields: ['id'],
          log,
        },
        trx,
      );

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    return details;
  }

  async updateBy({ condition, data, fields = ['*'], concurrentData, log } = {}, trx) {
    let updatedTaxDistrict;

    if (data.districtType === DISTRICT_TYPE.country) {
      const district = await super.getBy({
        condition: { districtType: DISTRICT_TYPE.country },
        fields: ['id'],
      });

      if (district?.id && district.id !== Number(condition.id)) {
        throw ApiError.conflict('No more than one country level district can exist');
      }
    }

    if (data.bbox) {
      data.bbox = toBbox(this.knex, data.bbox);
    }

    const _trx = trx || (await this.knex.transaction());

    let details;
    try {
      details = await super.updateBy(
        { condition, data, concurrentData, fields: log ? '*' : fields },
        _trx,
      );

      [updatedTaxDistrict] = await this.getBy({ condition, fields }, _trx);

      if (!updatedTaxDistrict) {
        if (!trx) {
          await _trx.rollback();
        }
        return null;
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

    log && this.log({ id: details.id, action: this.logAction.modify });

    return updatedTaxDistrict;
  }

  async getQBSum({ condition: { rangeFrom, rangeTo, integrationBuList, orderStatus } = {} }, trx) {
    const _trx = trx || (await this.knex.transaction());
    try {
      let query = _trx(this.historicalTableName)
        .withSchema(this.schemaName)
        .select([
          _trx.raw('sum(??)', `${OrderTaxDistrictTaxesRepository.TABLE_NAME}.amount`),
          `${this.historicalTableName}.id`,
        ])
        .innerJoin(
          OrderTaxDistrictRepository.TABLE_NAME,
          `${OrderTaxDistrictRepository.TABLE_NAME}.taxDistrictId`,
          `${this.historicalTableName}.id`,
        )
        .innerJoin(
          OrderTaxDistrictTaxesRepository.TABLE_NAME,
          `${OrderTaxDistrictTaxesRepository.TABLE_NAME}.orderTaxDistrictId`,
          `${OrderTaxDistrictRepository.TABLE_NAME}.id`,
        )
        .innerJoin(
          OrderRepository.TABLE_NAME,
          `${OrderTaxDistrictRepository.TABLE_NAME}.orderId`,
          `${OrderRepository.TABLE_NAME}.id`,
        )
        .where(`${OrderRepository.TABLE_NAME}.grandTotal`, '>', 0)
        .groupBy(`${this.historicalTableName}.id`)
        .orderBy(`${this.historicalTableName}.id`);

      if (orderStatus) {
        query = query.andWhere(`${OrderRepository.TABLE_NAME}.status`, orderStatus);
      }

      if (rangeFrom) {
        query = query.andWhere(`${OrderRepository.TABLE_NAME}.invoiceDate`, '>', rangeFrom);
      }

      if (rangeTo) {
        query = query.andWhere(`${OrderRepository.TABLE_NAME}.invoiceDate`, '<=', rangeTo);
      }

      if (integrationBuList?.length) {
        query = query.whereIn(`${OrderRepository.TABLE_NAME}.businessUnitId`, integrationBuList);
      }

      const result = await query;
      if (!trx) {
        await _trx.commit();
      }
      return result;
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    const item = await this.getBy({ condition: { id }, fields: ['*'] }, trx);

    return item || null;
  }
}

TaxDistrictRepository.TABLE_NAME = TABLE_NAME;

export default TaxDistrictRepository;
