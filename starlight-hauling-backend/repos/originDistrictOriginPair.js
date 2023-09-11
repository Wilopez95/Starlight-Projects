import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'origin_districts_origins';

class OriginDistrictOriginPairRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

OriginDistrictOriginPairRepository.TABLE_NAME = TABLE_NAME;

export default OriginDistrictOriginPairRepository;
