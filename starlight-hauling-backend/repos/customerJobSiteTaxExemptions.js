import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import difference from 'lodash/difference.js';

import BaseRepository from './_base.js';

const TABLE_NAME = 'customer_job_site_tax_exemptions';
const nonGroupExemptionsTable = 'customer_job_site_tax_exemptions_non_group';

class CustomerJobSiteTaxExemptionsRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['customerJobSiteId'];
  }

  async getBy({ condition: { customerJobSiteId }, fields = ['*'] }, trx = this.knex) {
    let result = {};

    const groupedTaxExemption = await super.getBy({ condition: { customerJobSiteId } }, trx);

    if (!isEmpty(groupedTaxExemption)) {
      result = groupedTaxExemption;
    }
    const selects = fields.map(field => `${nonGroupExemptionsTable}.${field}`);

    const nonGroupTaxExemptions = await trx(nonGroupExemptionsTable)
      .withSchema(this.schemaName)
      .select(...selects)
      .where({ customerJobSiteId });

    if (!isEmpty(nonGroupTaxExemptions)) {
      result.nonGroup = nonGroupTaxExemptions;
    }

    return isEmpty(result) ? null : result;
  }

  async upsert({ data, constraints, concurrentData } = {}, trx) {
    const { nonGroup = [], customerJobSiteId } = data;

    delete data.nonGroup;

    const _trx = trx || (await this.knex.transaction());

    let result;
    try {
      await super.upsert({ data, constraints, concurrentData }, _trx);

      if (!isEmpty(nonGroup)) {
        const allNonGroupExemptions = await _trx(nonGroupExemptionsTable)
          .withSchema(this.schemaName)
          .where({ customerJobSiteId });
        const allNonGroupExemptionsIds = map(allNonGroupExemptions, 'id');
        const removedExemptionIds = difference(
          allNonGroupExemptionsIds,
          nonGroup.filter(item => item.id).map(item => Number(item.id)),
        );

        await Promise.all(
          nonGroup.map(item => {
            item.customerJobSiteId = customerJobSiteId;

            return item.id
              ? _trx(nonGroupExemptionsTable)
                  .withSchema(this.schemaName)
                  .where({ id: item.id })
                  .update(item)
              : _trx(nonGroupExemptionsTable).withSchema(this.schemaName).insert(item);
          }),
        );

        if (!isEmpty(removedExemptionIds)) {
          await _trx(nonGroupExemptionsTable)
            .withSchema(this.schemaName)
            .whereIn('id', removedExemptionIds)
            .del();
        }
      } else {
        await _trx(nonGroupExemptionsTable)
          .withSchema(this.schemaName)
          .where({ customerJobSiteId })
          .del();
      }

      result = await this.getBy({ condition: { customerJobSiteId } }, _trx);

      if (!trx) {
        await _trx.commit();
      }
    } catch (error) {
      if (!trx) {
        await _trx.rollback();
      }
      throw error;
    }

    return result;
  }

  async getExemptedDistricts({ customerJobSiteId, taxDistrictIds }, trx = this.knex) {
    const groupedTaxExemption = await super.getBy(
      { condition: { customerJobSiteId }, fields: ['enabled'] },
      trx,
    );

    if (groupedTaxExemption?.enabled) {
      return taxDistrictIds;
    }

    const nonGroupExemptions = await trx(nonGroupExemptionsTable)
      .withSchema(this.schemaName)
      .select('taxDistrictId')
      .whereIn('taxDistrictId', taxDistrictIds)
      .andWhere({ customerJobSiteId, enabled: true });

    return map(nonGroupExemptions, 'taxDistrictId');
  }
}

CustomerJobSiteTaxExemptionsRepository.TABLE_NAME = TABLE_NAME;

export default CustomerJobSiteTaxExemptionsRepository;
