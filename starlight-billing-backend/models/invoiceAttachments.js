import BaseModel from './_base.js';

export default class InvoiceAttachments extends BaseModel {
  static get tableName() {
    return 'invoice_attachments';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['invoiceId', 'url', 'fileName'],

      properties: {
        id: { type: 'integer' },
        invoiceId: { type: 'integer' },
        url: { type: 'string' },
        fileName: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    const { Invoice } = this.models;
    return {
      invoice: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Invoice,
        join: {
          from: `${this.tableName}.invoiceId`,
          to: `${Invoice.tableName}.id`,
        },
      },
    };
  }
}
