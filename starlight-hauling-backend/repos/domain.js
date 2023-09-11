import BaseRepository from './_base.js';
import CompanyRepository from './company.js';

const SCHEMA_NAME = 'admin';
const TABLE_NAME = 'domains';

class DomainRepository extends BaseRepository {
  constructor(ctxState) {
    super(ctxState, { schemaName: SCHEMA_NAME, tableName: TABLE_NAME });
    this.upsertConstraints = ['name'];
  }

  async createOne({ data, log }) {
    const item = await super.createOne({ data });

    log &&
      this.log({
        id: data.tenantId,
        action: this.logAction.modify,
        entity: this.logEntity.companies,
        repo: CompanyRepository.getInstance(this.ctxState),
      });

    return item;
  }

  async updateBy({ condition, data, log }) {
    const item = await super.updateBy({ condition, data });

    log &&
      this.log({
        id: item.tenantId,
        action: this.logAction.modify,
        entity: this.logEntity.companies,
        repo: CompanyRepository.getInstance(this.ctxState),
      });

    return item;
  }

  async deleteBy({ condition, log }, trx = this.knex) {
    const items = await this.getAll({ condition }, trx);

    await super.deleteBy({ condition }, trx);

    log &&
      items?.forEach(
        item =>
          this.log({
            id: item.tenantId,
            action: this.logAction.modify,
            entity: this.logEntity.companies,
            repo: CompanyRepository.getInstance(this.ctxState),
          }),
        this,
      );
  }
}

DomainRepository.TABLE_NAME = TABLE_NAME;

export default DomainRepository;
