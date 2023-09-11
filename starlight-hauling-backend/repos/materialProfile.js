import compose from 'lodash/fp/compose.js';
import isEmpty from 'lodash/isEmpty.js';

import { unambiguousCondition } from '../utils/dbHelpers.js';
import VersionedRepository from './_versioned.js';
import MaterialRepo from './material.js';
import DisposalSiteRepo from './disposalSite.js';

const TABLE_NAME = 'material_profiles';

class MaterialProfileRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(super.camelCaseKeys, super.mapFields)(originalObj);
  }

  async getAllPopulated({ condition = {}, materials, disposals, fields = ['*'] }, trx = this.knex) {
    const selects = fields.map(field => `${this.tableName}.${field}`);

    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .where(isEmpty(condition) ? {} : unambiguousCondition(this.tableName, condition))
      .orderBy(`${this.tableName}.id`);

    if (materials) {
      selects.push(
        trx.raw('??.?? as ??', [MaterialRepo.TABLE_NAME, 'description', 'materialDescription']),
      );

      query = query.innerJoin(
        MaterialRepo.TABLE_NAME,
        `${MaterialRepo.TABLE_NAME}.id`,
        `${this.tableName}.materialId`,
      );
    }
    if (disposals) {
      selects.push(
        trx.raw('??.?? as ??', [
          DisposalSiteRepo.TABLE_NAME,
          'description',
          'disposalSiteDescription',
        ]),
      );

      query = query.innerJoin(
        DisposalSiteRepo.TABLE_NAME,
        `${DisposalSiteRepo.TABLE_NAME}.id`,
        `${this.tableName}.disposalSiteId`,
      );
      if (condition.active) {
        query = query.andWhere(`${DisposalSiteRepo.TABLE_NAME}.active`, true);
      }
    }

    const items = await query.select(selects);

    return items?.map(this.mapFields.bind(this)) ?? [];
  }

  async getByIdToLog(id, trx = this.knex) {
    let query = super.getByIdQuery(id, trx);

    let selects = [`${this.tableName}.*`];
    ({ query, selects } = await super.populateBl({ query, selects }));

    let jtName = MaterialRepo.TABLE_NAME;
    let joinedTableColumns = await MaterialRepo.getColumnsToSelect({
      alias: 'material',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.materialId`);

    jtName = DisposalSiteRepo.TABLE_NAME;
    joinedTableColumns = await DisposalSiteRepo.getColumnsToSelect({
      alias: 'disposalSite',
      tableName: jtName,
      schemaName: this.schemaName,
    });

    selects.push(...joinedTableColumns);
    query = query.innerJoin(jtName, `${jtName}.id`, `${this.tableName}.disposalSiteId`);

    const item = await query.select(selects);

    return item
      ? compose(super.mapNestedObjects.bind(this, []), super.mapJoinedFields, this.mapFields)(item)
      : null;
  }
}

MaterialProfileRepository.TABLE_NAME = TABLE_NAME;

export default MaterialProfileRepository;
