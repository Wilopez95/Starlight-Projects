import { DEFAULT_BUSINESS_LINES_SEED_DATA } from '../../../consts/businessLineTypes.js';

export const up = async (migrationBuilder, schema) => {
  /**
   *  DEFAULT BUSINESS LINES
   */
  // to avoid manual sync
  /// TODO: remove this extra check when the squash
  const lobs = await migrationBuilder.knex('business_lines').withSchema(schema).select('id');
  if (!lobs?.length) {
    await migrationBuilder
      .knex('business_lines')
      .withSchema(schema)
      .insert(DEFAULT_BUSINESS_LINES_SEED_DATA)
      .returning('id');
  }
};
