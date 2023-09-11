import compose from 'lodash/fp/compose.js';

import { unambiguousSelect } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import CustomerRepository from './customer.js';
import BusinessUnitRepository from './businessUnit.js';
import BusinessUnitLineRepository from './businessUnitLine.js';
import BusinessLineRepository from './businessLine.js';

const TABLE_NAME = 'customer_groups';

class CustomerGroupRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['description'];
  }

  mapFields(obj) {
    return compose(super.camelCaseKeys, super.mapFields)(obj);
  }

  async getAllWithCustomers({ fields = ['*'], joinCustomers } = {}, trx = this.knex) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(unambiguousSelect(this.tableName, fields));

    if (joinCustomers) {
      query = query
        .leftJoin(
          `${CustomerRepository.TABLE_NAME}`,
          `${CustomerRepository.TABLE_NAME}.customerGroupId`,
          `${this.tableName}.id`,
        )
        .select(
          this.knex.raw('array_agg(??.??) as ??', [
            CustomerRepository.TABLE_NAME,
            'id',
            'customerIds',
          ]),
        )
        .groupBy(`${this.tableName}.id`)
        .orderBy(`${this.tableName}.id`);
    }
    const items = await query;
    return items;
  }

  async getAllWithCustomersQB(trx = this.knex) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(
        unambiguousSelect(this.tableName, [
          'id as customerGroupId',
          'description as customerGroupName',
        ]),
      );
    query = query
      .leftJoin(
        `${CustomerRepository.TABLE_NAME}`,
        `${CustomerRepository.TABLE_NAME}.customerGroupId`,
        `${this.tableName}.id`,
      )
      .leftJoin(
        `${BusinessUnitRepository.TABLE_NAME}`,
        `${BusinessUnitRepository.TABLE_NAME}.id`,
        `${CustomerRepository.TABLE_NAME}.businessUnitId`,
      )
      .leftJoin(
        `${BusinessUnitLineRepository.TABLE_NAME}`,
        `${BusinessUnitLineRepository.TABLE_NAME}.businessLineId`,
        `${BusinessUnitRepository.TABLE_NAME}.id`,
      )
      .leftJoin(
        `${BusinessLineRepository.TABLE_NAME}`,
        `${BusinessLineRepository.TABLE_NAME}.id`,
        `${BusinessUnitLineRepository.TABLE_NAME}.businessLineId`,
      )
      .select(unambiguousSelect(`${BusinessUnitLineRepository.TABLE_NAME}`, ['businessLineId']))
      .select(
        unambiguousSelect(`${BusinessLineRepository.TABLE_NAME}`, ['name as businessLineName']),
      )
      .select(
        this.knex.raw(
          `CONCAT(${this.tableName}.id, '-', ${BusinessUnitLineRepository.TABLE_NAME}.business_line_id) as key`,
        ),
      )
      .select(unambiguousSelect(`${CustomerRepository.TABLE_NAME}`, ['id as customerId']))
      .orderBy(`${this.tableName}.id`);
    const items = await query;
    return items;
  }
}

CustomerGroupRepository.TABLE_NAME = TABLE_NAME;

export default CustomerGroupRepository;
