import RatesRepository from './_rates.js';
import GlobalRatesThresholdRepo from './globalRatesThreshold.js';

const TABLE_NAME = 'global_thresholds_setting';

class GlobalThresholdsSettingRepository extends RatesRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['businessUnitId', 'businessLineId', 'thresholdId'];
  }

  async upsert({ data, constraints, onConflict, concurrentData, fields = ['*'], log } = {}, trx) {
    const result = await super.upsert(
      {
        data,
        constraints,
        onConflict,
        concurrentData,
        fields: log ? ['*'] : fields,
      },
      trx,
    );

    log &&
      this.log({
        id: result.id,
        action: this.logAction.modify,
        entity: this.logEntity[this.tableName],
        repo: GlobalRatesThresholdRepo.getInstance(this.ctxState),
      });

    return result ? super.camelCaseKeys(result) : result;
  }
}

GlobalThresholdsSettingRepository.TABLE_NAME = TABLE_NAME;

export default GlobalThresholdsSettingRepository;
