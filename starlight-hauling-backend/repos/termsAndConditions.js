import BusinessUnitRepository from './businessUnit.js';
import CustomerRepository from './customer.js';
import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'terms_and_conditions';

class TermsAndConditionsRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  getById(id) {
    return this.knex(this.tableName)
      .withSchema(this.schemaName)
      .select('*')
      .where(`${this.tableName}.id`, id)
      .first()
      .then(row => row);
  }

  async getByReqId(tenantName, reqId) {
    const businessUnitTable = BusinessUnitRepository.TABLE_NAME;
    const customerTable = CustomerRepository.TABLE_NAME;

    const query = this.knex(this.tableName)
      .withSchema(tenantName)
      .select([
        this.knex.raw('to_json(??.*) as ??', [this.tableName, 'termsAndConditions']),
        this.knex.raw('to_json(??.*) as ??', [businessUnitTable, 'businessUnit']),
        this.knex.raw('to_json(??.*) as ??', [customerTable, 'customer']),
      ])
      .innerJoin(customerTable, `${this.tableName}.id`, `${customerTable}.tcId`)
      .leftJoin(businessUnitTable, `${customerTable}.businessUnitId`, `${businessUnitTable}.id`)
      .where(`${this.tableName}.tcReqId`, reqId)
      .first()
      .then(row => row);

    const result = await query;
    return result;
  }

  async createOne({ data, fields = ['*'] } = {}) {
    let termsAndConditions;
    const trx = await this.knex.transaction();

    try {
      termsAndConditions = await super.createOne(
        {
          data,
          fields,
        },
        trx,
        { noRecord: true },
      );
      await trx.commit();
      return termsAndConditions;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updateOne({ condition: { id }, data, fields = ['*'] } = {}) {
    let termsAndConditions;
    const trx = await this.knex.transaction();
    try {
      termsAndConditions = await super.updateBy(
        {
          condition: { id },
          data,
          fields,
          noUpdateAt: true,
        },
        trx,
        { noRecord: true, skipEmpty: true },
      );
      await trx.commit();
      return termsAndConditions;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async updateByReqId({ reqId, tenantName, data, fields = '*' } = {}) {
    const trx = await this.knex.transaction();
    try {
      const query = this.knex(this.tableName)
        .withSchema(tenantName)
        .update(data, fields)
        .where(`${this.tableName}.tcReqId`, reqId);
      const termsAndConditions = await query;
      await trx.commit();
      return termsAndConditions?.[0] || null;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

TermsAndConditionsRepository.TABLE_NAME = TABLE_NAME;

export default TermsAndConditionsRepository;
