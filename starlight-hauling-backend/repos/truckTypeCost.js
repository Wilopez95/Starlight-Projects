import compose from 'lodash/fp/compose.js';

import VersionedRepository from './_versioned.js';

const TABLE_NAME = 'truck_types_costs';

class TruckTypesCostsRepository extends VersionedRepository {
  constructor(ctxState, { schemaName }) {
    super(ctxState, { schemaName, tableName: TABLE_NAME });
  }

  mapFields(originalObj) {
    return compose(
      super.mapNestedObjects.bind(this, []),
      super.camelCaseKeys,
      super.mapFields,
    )(originalObj);
  }
}

TruckTypesCostsRepository.TABLE_NAME = TABLE_NAME;

export default TruckTypesCostsRepository;
