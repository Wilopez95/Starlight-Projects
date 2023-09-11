import MediaRepository from './_media.js';

const TABLE_NAME = 'customers_media';
const RELATION_NAME = 'customerId';

class CustomerMediaRepository extends MediaRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME, relationName: RELATION_NAME });
  }
}

CustomerMediaRepository.TABLE_NAME = TABLE_NAME;

export default CustomerMediaRepository;
