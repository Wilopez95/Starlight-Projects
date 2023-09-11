import map from 'lodash/map.js';
import isEmpty from 'lodash/isEmpty.js';
import difference from 'lodash/difference.js';

import VersionedRepository from './_versioned.js';
import TaxDistrictRepository from './taxDistrict.js';
import CustomerJobSitePairRepository from './customerJobSitePair.js';

const TABLE_NAME = 'customer_job_site_pair_tax_districts';

class TaxDistrictCustomerJobSiteRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  getAllByIds({ condition: { ids = [] }, fields = ['*'] } = {}, trx = this.knex) {
    return trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('customerJobSitePairId', ids)
      .select(fields);
  }

  getTaxDistrictsByPairId(pairId, trx = this.knex) {
    return TaxDistrictRepository.getInstance(this.ctxState).getBy(
      {
        condition: {
          active: true,
          ids: trx(this.tableName)
            .withSchema(this.schemaName)
            .select('taxDistrictId')
            .where('customerJobSitePairId', pairId),
        },
      },
      trx,
    );
  }

  async updateMany({ data, pairId, fields = ['id'] }, trx = this.knex) {
    const currentTaxDistricts = await trx(this.tableName)
      .withSchema(this.schemaName)
      .select('taxDistrictId')
      .where('customerJobSitePairId', pairId);

    const currentTaxDistrictIds = map(currentTaxDistricts, 'taxDistrictId');

    if (isEmpty(data) && !isEmpty(currentTaxDistricts)) {
      await this.deleteByIds({ ids: currentTaxDistrictIds }, trx);
      return null;
    }

    const updatedDistricts = await Promise.all(
      data.map(taxDistrict => {
        const { id, ...districtData } = taxDistrict;
        return super.updateBy({ condition: { id }, data: districtData, fields }, trx);
      }),
    );

    const taxDistrictIds = map(data, 'id');
    const removedTaxDistrictIds = difference(currentTaxDistrictIds, taxDistrictIds);

    if (!isEmpty(removedTaxDistrictIds)) {
      await this.deleteByIds({ ids: removedTaxDistrictIds }, trx);
    }

    return updatedDistricts;
  }

  async addMaterializedTaxDistrict({ taxDistrictId, affectedJobSites }, trx = this.knex) {
    const customerJobSitePairs = await CustomerJobSitePairRepository.getInstance(
      this.ctxState,
    ).getAll({
      condition: builder => builder.whereIn('jobSiteId', affectedJobSites),
      fields: ['id'],
    });

    if (isEmpty(customerJobSitePairs)) {
      return;
    }

    const customerJobSitePairIds = map(customerJobSitePairs, 'id');

    await trx(this.tableName)
      .withSchema(this.schemaName)
      .insert(
        customerJobSitePairIds.map(customerJobSitePairId => ({
          taxDistrictId,
          customerJobSitePairId,
        })),
      );
  }
}

TaxDistrictCustomerJobSiteRepository.TABLE_NAME = TABLE_NAME;

export default TaxDistrictCustomerJobSiteRepository;
