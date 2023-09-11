import compose from 'lodash/fp/compose.js';
import { startOfToday } from 'date-fns';

import ApiError from '../errors/ApiError.js';
import { SORT_ORDER } from '../consts/sortOrders.js';
import VersionedRepository from './_versioned.js';
import CustomerJobSitePairRepo from './customerJobSitePair.js';
import CustomerRepo from './customer.js';

const TABLE_NAME = 'projects';

class ProjectRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async validateBooleans({ customerJobSiteId, poRequired, permitRequired }, trx) {
    const pair = await CustomerJobSitePairRepo.getInstance(this.ctxState).getById(
      {
        id: customerJobSiteId,
        fields: ['poRequired', 'permitRequired'],
      },
      trx,
    );

    if (!pair) {
      throw ApiError.notFound(`CJS pair with id ${customerJobSiteId} does not exist`);
    }

    const error = prop =>
      ApiError.invalidRequest(
        `Project booleans do not meet func requirements for property ${prop}`,
      );

    if (pair.poRequired && !poRequired) {
      throw error('poRequired');
    }
    if (pair.permitRequired && !permitRequired) {
      throw error('permitRequired');
    }
    return true;
  }

  async createOne({ data, fields = ['*'], log }, trx) {
    await this.validateBooleans(data, trx);

    return super.createOne({ data, fields, log }, trx);
  }

  async updateBy({ condition, data, fields = ['*'], concurrentData, log }, trx) {
    await this.validateBooleans(data, trx);

    return super.updateBy({ condition, data, fields, concurrentData, log }, trx);
  }

  updateByIds({ ids = [], data, log }, trx) {
    return Promise.all(
      ids.map(id =>
        super.updateBy(
          {
            condition: { id },
            data,
            log,
          },
          trx,
        ),
      ),
    );
  }

  async getAllPaginated({
    condition,
    currentOnly = false,
    skip = 0,
    limit = 25,
    fields = ['*'],
    mostRecent,
  } = {}) {
    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(fields)
      .limit(limit)
      .offset(skip)
      .where(condition);

    if (mostRecent) {
      query = query.orderBy('createdAt', SORT_ORDER.desc);
    }

    if (currentOnly) {
      const today = startOfToday();

      query = query.andWhereRaw(
        `(start_date <= ? or start_date is null) and (end_date >= ? or end_date is null)`,
        [today, today],
      );
    }

    const projects = await query.orderBy('id');

    return projects ?? [];
  }

  async getAllPaginatedByCustomer({
    condition: { customerId },
    skip = 0,
    limit = 25,
    fields = ['*'],
    mostRecent,
  } = {}) {
    let query = this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select(fields?.map(field => `${this.tableName}.${field}`) ?? [])
      .limit(limit)
      .offset(skip)
      .innerJoin(
        CustomerJobSitePairRepo.TABLE_NAME,
        `${CustomerJobSitePairRepo.TABLE_NAME}.id`,
        `${this.tableName}.customerJobSiteId`,
      )
      .innerJoin(
        CustomerRepo.TABLE_NAME,
        `${CustomerJobSitePairRepo.TABLE_NAME}.customerId`,
        `${CustomerRepo.TABLE_NAME}.id`,
      )
      .where(`${CustomerRepo.TABLE_NAME}.id`, customerId)
      .groupBy(`${this.tableName}.id`);

    if (mostRecent) {
      query = query.orderBy(`${this.tableName}.createdAt`, SORT_ORDER.desc);
    }

    const projects = await query.orderBy(`${this.tableName}.id`, SORT_ORDER.desc);

    return projects ?? [];
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];
    const jtName = CustomerJobSitePairRepo.TABLE_NAME;
    const joinedTableColumns = await CustomerJobSitePairRepo.getColumnsToSelect({
      alias: 'customerJobSite',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.customerJobSiteId`);

    const item = await query.select(selects);

    return item ? compose(super.mapJoinedFields, this.mapFields.bind(this))(item) : null;
  }
}

ProjectRepository.TABLE_NAME = TABLE_NAME;

export default ProjectRepository;
