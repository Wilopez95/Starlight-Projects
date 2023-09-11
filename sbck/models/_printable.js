import BaseModel from './_base.js';

export default class PrintableModel extends BaseModel {
  static async getPdfUrls(ids) {
    const result = await this.query()
      .findByIds(ids)
      .select(['id', 'pdfUrl', 'createdAt'])
      .orderBy('id');

    return result;
  }

  static async getByIdsForMailing(ids) {
    const items = await this.query().findByIds(ids).withGraphFetched('customer');

    return items;
  }
}
