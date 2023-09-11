import camelCase from 'lodash/fp/camelCase.js';
import VersionedRepository from './_versioned.js';

import BillableServicesRepository from './billableService.js';

const TABLE_NAME = 'billable_services_include_services';

class BillableServiceInclusion extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async deleteIncludedServicesByServiceId(
    { billableServiceId, includedServiceIds },
    trx = this.knex,
  ) {
    await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('includedServiceId', includedServiceIds)
      .andWhere({ billableServiceId })
      .del();
  }

  getAggregatedIncludedServicesTable({ joinAs, shouldPopulate = false }, trx = this.knex) {
    const includedServicesSubQuery = trx(this.tableName)
      .withSchema(this.schemaName)
      .groupBy(`${this.tableName}.billableServiceId`)
      .as(joinAs);

    if (shouldPopulate) {
      const includedFields = [
        'id',
        'active',
        'action',
        'description',
        'one_time',
        'material_based',
        'unit',
        'import_codes',
      ];

      const includedFieldsMapping = includedFields
        .flatMap(field => [
          `'${camelCase(field)}'`,
          `${BillableServicesRepository.TABLE_NAME}.${field}`,
        ])
        .join(', ');

      includedServicesSubQuery
        .select([
          `${this.tableName}.billableServiceId`,
          trx.raw(`json_agg(json_build_object(${includedFieldsMapping})) as ??`, ['services']),
        ])
        .leftJoin(
          BillableServicesRepository.TABLE_NAME,
          `${this.tableName}.includedServiceId`,
          `${BillableServicesRepository.TABLE_NAME}.id`,
        );
    } else {
      includedServicesSubQuery.select([
        `${this.tableName}.billableServiceId`,
        trx.raw(`array_agg(??.??) as ??`, [this.tableName, 'includedServiceId', 'services']),
      ]);
    }

    return includedServicesSubQuery;
  }

  getIncludedServicesByServiceId({ billableServiceId }, trx = this.knex) {
    return this.getAggregatedIncludedServicesTable({}, trx).where({ billableServiceId }).first();
  }

  getIncludedServicesByServiceIdBulk({ billableServiceIds = [] }, trx = this.knex) {
    return this.getAggregatedIncludedServicesTable({}, trx).whereIn(
      'billableServiceId',
      billableServiceIds,
    );
  }

  async insertMany({ includedServiceIds, billableServiceId }, trx = this.knex) {
    const data = includedServiceIds.map(includedServiceId => ({
      includedServiceId,
      billableServiceId,
    }));

    await super.insertMany({ data }, trx);
  }
}

BillableServiceInclusion.TABLE_NAME = TABLE_NAME;

export default BillableServiceInclusion;
