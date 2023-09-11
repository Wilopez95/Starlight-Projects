import objection from 'objection';

const { Model } = objection;

export default class BaseModel extends Model {
  static get schemaName() {
    return 'admin';
  }

  static get models() {
    return null;
  }

  static get appContext() {
    return {
      state: {},
    };
  }

  static get user() {
    return this.appContext.state.user;
  }

  static get jsonAttributes() {
    // necessary for postgres array type usage
    return [];
  }

  static query(...args) {
    const query = super.query(...args);

    if (query.has('withSchema') || this.schemaName === undefined) {
      return query;
    }

    return query.withSchema(this.schemaName);
  }

  static async upsertMany({ data }, trx) {
    await this.query(trx).upsertGraph(data, { insertMissing: true });
  }

  $beforeInsert() {
    this.createdAt = new Date().toUTCString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toUTCString();
  }

  static async getBy({ condition, fields = ['*'] } = {}, trx) {
    const item = await this.query(trx).where(condition).select(fields).first();
    return item;
  }

  static async getAll({ condition = {}, fields = ['*'] } = {}, trx) {
    const items = await this.query(trx).where(condition).select(fields);
    return items;
  }

  static async getById(id, fields = ['*'], trx) {
    const item = await this.query(trx).findById(id).select(fields);
    return item;
  }

  static async getByIds(ids, fields = ['*'], trx) {
    const items = await this.query(trx).findByIds(ids).select(fields);
    return items;
  }

  static async patchById(id, data = {}, trx) {
    await this.query(trx).findById(id).patch(data);
  }

  static async patchAndFetchById(id, data = {}, trx) {
    const item = await this.query(trx).findById(id).patch(data).returning('*');
    return item;
  }

  static async patchBy({ condition = {}, data = {} }, trx) {
    await this.query(trx).where(condition).patch(data);
  }

  async $patch(data = {}) {
    await this.$query().patch(data);
  }

  async $patchAndFetch(data = {}, trx) {
    const item = await this.$query(trx).patchAndFetch(data);
    return item;
  }

  static async patchAndFetchMany(data = [], trx) {
    const patchPromises = data.map(({ id, ...restItem }) =>
      this.query(trx).patchAndFetchById(id, restItem),
    );

    const result = await Promise.all(patchPromises);

    return result;
  }

  static async deleteById(id, trx) {
    await this.query(trx).deleteById(id);
  }

  static async upsert(data) {
    const trx = await this.startTransaction();
    if (data.id) {
      data.id = Number(data.id);
    }

    try {
      await this.query(trx).upsertGraph(data, { insertMissing: true });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
