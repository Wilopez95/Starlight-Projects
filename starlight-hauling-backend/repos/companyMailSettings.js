import BaseRepository from './_base.js';
import CompanyRepository from './company.js';

const SCHEMA_NAME = 'admin';
const TABLE_NAME = 'company_mail_settings';

class CompanyMailSettingsRepository extends BaseRepository {
  constructor(ctxState) {
    super(ctxState, { schemaName: SCHEMA_NAME, tableName: TABLE_NAME });
    this.upsertConstraints = ['tenantId'];
  }

  async upsert({ data, constraints, concurrentData, log } = {}) {
    const result = await super.upsert({ data, constraints, concurrentData });

    log &&
      this.log({
        id: data.tenantId,
        action: this.logAction.modify,
        entity: this.logEntity.companies,
        repo: CompanyRepository.getInstance(this.ctxState),
      });

    return result ? super.camelCaseKeys(result) : result;
  }
}

CompanyMailSettingsRepository.TABLE_NAME = TABLE_NAME;
CompanyMailSettingsRepository.SCHEMA_NAME = SCHEMA_NAME;

export default CompanyMailSettingsRepository;
