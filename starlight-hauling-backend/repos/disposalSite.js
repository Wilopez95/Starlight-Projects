import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import { tabAddressFields, putLocationField } from '../utils/dbHelpers.js';
import { toGeoJson } from '../utils/postgis.js';
import VersionedRepository from './_versioned.js';
import BusinessUnitRepo from './businessUnit.js';

const TABLE_NAME = 'disposal_sites';

class DisposalSiteRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['description'];
  }

  mapFields(obj) {
    return compose(tabAddressFields, putLocationField, super.mapFields)(obj);
  }

  async createOne({ data, fields = ['*'], log } = {}) {
    data.location = toGeoJson(this.knex, data.location);

    if (fields.includes('location')) {
      fields.push('coordinates');
    }

    const disposalSite = await super.createOne({ data, fields, log });

    if (disposalSite.coordinates) {
      disposalSite.location = {
        type: 'Point',
        coordinates: disposalSite.coordinates,
      };
    }

    return disposalSite ? this.mapFields(disposalSite) : null;
  }

  async getAll({ condition = {}, fields = ['*'], orderBy = [] } = {}, trx = this.knex) {
    let query = trx(this.tableName).withSchema(this.schemaName).select(fields);
    if (condition?.active) {
      query = query.where({ active: true });
    }
    if (condition?.description) {
      query = query.whereRaw(`${this.tableName}.description iLike '%${condition.description}%'`);
    }
    const items = await query.orderBy(orderBy);

    return isEmpty(items) ? [] : items.map(this.mapFields.bind(this));
  }

  async updateBy({ condition, data, fields = ['*'], concurrentData, log } = {}) {
    if (data.location) {
      data.location = toGeoJson(this.knex, data.location);
    }

    if (fields.includes('location')) {
      fields.push('coordinates');
    }

    const disposalSite = await super.updateBy({
      condition,
      data,
      fields,
      concurrentData,
      log,
    });

    if (disposalSite.coordinates) {
      disposalSite.location = {
        type: 'Point',
        coordinates: disposalSite.coordinates,
      };
    }

    return this.mapFields(disposalSite);
  }

  async getBy({ condition, fields = ['*'] } = {}, trx = this.knex) {
    try {
      const item = await super.getBy({ fields, condition }, trx);
      if (item.coordinates) {
        item.location = {
          type: 'Point',
          coordinates: item.coordinates,
        };
      }
      const result = item ? this.mapFields(item) : null;
      return result;
    } catch (error) {
      return null;
    }
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    const selects = [`${this.tableName}.*`];

    const jtName = BusinessUnitRepo.TABLE_NAME;
    const joinedTableColumns = await BusinessUnitRepo.getInstance(this.ctxState).getColumnsToSelect(
      'recyclingFacility',
    );

    selects.push(...joinedTableColumns);
    query = query.leftJoin(jtName, `${jtName}.id`, `${this.tableName}.businessUnitId`);

    const item = await query.select(selects);

    return item ? compose(this.mapFields, super.mapJoinedFields, super.camelCaseKeys)(item) : null;
  }
}

DisposalSiteRepository.TABLE_NAME = TABLE_NAME;

export default DisposalSiteRepository;
