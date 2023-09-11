import BaseRepository from './_base.js';

const TABLE_NAME = 'frequencies';

class FrequencyRepository extends BaseRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  async getByFrequencyData(
    { condition: { frequencies = [] }, fields = ['*'] } = {},
    trx = this.knex,
  ) {
    const query = trx(this.tableName).withSchema(this.schemaName).select(fields);

    frequencies.forEach(frequency => {
      query.orWhere(builder => {
        builder.where('type', frequency.type);
        frequency?.times && builder.where('times', frequency.times);
        return builder;
      });
    });

    const frequenciesData = await query;
    return frequenciesData;
  }

  async getAllByIds({ condition: { ids = [] }, fields = ['*'] } = {}, trx = this.knex) {
    const frequencies = await trx(this.tableName)
      .withSchema(this.schemaName)
      .whereIn('id', ids)
      .select(fields);

    return frequencies;
  }
}

FrequencyRepository.TABLE_NAME = TABLE_NAME;

export default FrequencyRepository;
