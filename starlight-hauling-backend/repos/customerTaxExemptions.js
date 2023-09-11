import isEmpty from 'lodash/isEmpty.js';
import map from 'lodash/map.js';
import difference from 'lodash/difference.js';

import BaseRepository from './_base.js';
import CustomerJobSiteExemptionRepo from './customerJobSiteTaxExemptions.js';

const TABLE_NAME = 'customer_tax_exemptions';
const nonGroupExemptionsTable = 'customer_tax_exemptions_non_group';

class CustomerTaxExemptionsRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['customerId'];
  }

  async getBy({ condition: { customerId }, fields = ['*'] }, trx = this.knex) {
    let result = {};

    const groupedTaxExemption = await super.getBy({ condition: { customerId } }, trx);

    if (!isEmpty(groupedTaxExemption)) {
      result = groupedTaxExemption;
    }
    const selects = fields.map(field => `${nonGroupExemptionsTable}.${field}`);

    const nonGroupTaxExemptions = await trx(nonGroupExemptionsTable)
      .withSchema(this.schemaName)
      .select(...selects)
      .where({ customerId });

    if (!isEmpty(nonGroupTaxExemptions)) {
      result.nonGroup = nonGroupTaxExemptions;
    }

    return isEmpty(result) ? null : result;
  }

  async upsert({ data } = {}, trx) {
    const { nonGroup = [], customerId } = data;

    delete data.nonGroup;

    const _trx = trx || (await this.knex.transaction());

    let result;
    try {
      // await super.upsert({ formatData, constraints, concurrentData }, _trx);
      if (data.id) {
        await _trx(TABLE_NAME).withSchema(this.schemaName).where({ id: data.id }).update(data);
      } else {
        await _trx(TABLE_NAME)
          .withSchema(this.schemaName)
          .insert({ ...data, enabled: isEmpty(nonGroup) });
      }
      if (!isEmpty(nonGroup)) {
        const allNonGroupExemptions = await _trx(nonGroupExemptionsTable)
          .withSchema(this.schemaName)
          .where({ customerId });
        const allNonGroupExemptionsIds = map(allNonGroupExemptions, 'id');
        const removedExemptionIds = difference(
          allNonGroupExemptionsIds,
          nonGroup.filter(item => item.id).map(item => Number(item.id)),
        );

        await Promise.all(
          nonGroup.map(item => {
            item.customerId = customerId;

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
        await _trx(nonGroupExemptionsTable).withSchema(this.schemaName).where({ customerId }).del();
      }

      result = await this.getBy({ condition: { customerId } }, _trx);

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

  async getExemptedDistricts(
    { customerId, customerJobSiteId, taxDistrictIds, useCustomerJobSite = true },
    trx = this.knex,
  ) {
    const groupedCustomerExemption = await super.getBy(
      { condition: { customerId }, fields: ['enabled'] },
      trx,
    );

    let exemptedDistrictIds = [];

    if (groupedCustomerExemption?.enabled) {
      exemptedDistrictIds = taxDistrictIds;
    } else {
      const nonGroupCustomerExemptions = await trx(nonGroupExemptionsTable)
        .withSchema(this.schemaName)
        .select('taxDistrictId')
        .whereIn('taxDistrictId', taxDistrictIds)
        .andWhere({ customerId, enabled: true });

      exemptedDistrictIds = map(nonGroupCustomerExemptions, 'taxDistrictId');

      if (
        useCustomerJobSite &&
        customerJobSiteId &&
        exemptedDistrictIds.length < taxDistrictIds.length
      ) {
        const exemptedByCustomerJobSite = await CustomerJobSiteExemptionRepo.getInstance(
          this.ctxState,
        ).getExemptedDistricts(
          {
            customerJobSiteId,
            taxDistrictIds: taxDistrictIds.filter(
              district => !exemptedDistrictIds.includes(district),
            ),
          },
          trx,
        );

        exemptedDistrictIds = exemptedDistrictIds.concat(exemptedByCustomerJobSite);
      }
    }

    return exemptedDistrictIds;
  }
}

CustomerTaxExemptionsRepository.TABLE_NAME = TABLE_NAME;

export default CustomerTaxExemptionsRepository;
