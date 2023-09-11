import { PAYMENT_GATEWAYS } from '../consts/paymentGateways.js';
import BaseModel from './_base.js';

export default class Merchant extends BaseModel {
  static get tableName() {
    return 'merchants';
  }

  static get jsonSchema() {
    return {
      type: 'object',

      required: ['id', 'businessUnitId', 'paymentGateway'],

      properties: {
        id: { type: 'integer' },
        businessUnitId: { type: 'integer' },
        paymentGateway: { enum: PAYMENT_GATEWAYS },
        mid: { type: ['string', null] },
        username: { type: ['string', null] },
        password: { type: ['string', null] },
        salespointMid: { type: ['string', null] },
        salespointUsername: { type: ['string', null] },
        salespointPassword: { type: ['string', null] },
      },
    };
  }

  static get relationMappings() {
    const { BusinessUnit, CreditCard } = this.models;
    return {
      businessUnit: {
        relation: BaseModel.HasOneRelation,
        modelClass: BusinessUnit,
        join: {
          from: `${this.tableName}.id`,
          to: `${BusinessUnit.tableName}.merchantId`,
        },
      },
      creditCard: {
        relation: BaseModel.HasManyRelation,
        modelClass: CreditCard,
        join: {
          from: `${this.tableName}.id`,
          to: `${CreditCard.tableName}.merchantId`,
        },
      },
    };
  }
}
