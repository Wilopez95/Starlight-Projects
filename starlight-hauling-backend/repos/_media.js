import VersionedRepository from './_versioned.js';

class MediaRepository extends VersionedRepository {
  constructor(ctxState, { schemaName, relationName, tableName }) {
    super(ctxState, { schemaName, tableName });
    this.relation = relationName;
  }

  async createOneFromUrl(relationId, fileUrl, author) {
    const fileUrlParts = fileUrl.split('/');
    const fileName = fileUrlParts.pop();
    const fileId = fileUrlParts[fileUrlParts.length - 1];

    try {
      const subscriptionContractMedia = await super.createOne({
        data: {
          id: fileId,
          fileName,
          url: fileUrl,
          author,
          [this.relation]: relationId,
        },
      });

      return subscriptionContractMedia;
    } catch (error) {
      return {
        fileName,
        error: error.message,
      };
    }
  }

  getAllPaginated({ condition: { relationId }, skip = 0, limit = 25 }, trx = this.knex) {
    let query = trx(this.tableName)
      .withSchema(this.schemaName)
      .select(['*'])
      .where(`${this.tableName}.${this.relation}`, relationId)
      .orderBy(`${this.tableName}.updatedAt`, 'desc');

    if (limit) {
      query = query.limit(limit);
    }
    if (skip) {
      query = query.offset(skip);
    }

    return query;
  }
}

export default MediaRepository;
