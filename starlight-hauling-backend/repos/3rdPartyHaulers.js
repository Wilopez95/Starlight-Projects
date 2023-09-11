import VersionedRepository from './_versioned.js';

const TABLE_NAME = '3rd_party_haulers';

class ThirdPartyHaulersRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }
}

ThirdPartyHaulersRepository.TABLE_NAME = TABLE_NAME;

export default ThirdPartyHaulersRepository;
