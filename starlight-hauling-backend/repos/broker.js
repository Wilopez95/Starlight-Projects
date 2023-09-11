import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'brokers';

class BrokerRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
    this.upsertConstraints = ['email'];
  }
}

BrokerRepository.TABLE_NAME = TABLE_NAME;

export default BrokerRepository;
