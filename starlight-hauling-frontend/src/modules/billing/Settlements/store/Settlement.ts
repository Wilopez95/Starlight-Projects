import { camelCase } from 'lodash-es';
import { action, observable } from 'mobx';

import { convertDates, substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { JsonConversions, PaymentGateway } from '../../../../types';
import { ISettlement, ISettlementTransaction } from '../types';

import { type SettlementStore } from './SettlementStore';

export class Settlement extends BaseEntity implements ISettlement {
  date: Date;
  paymentGateway: PaymentGateway;
  fees: number;
  amount: number;
  adjustments: number;
  count: number;
  mid: string;
  settlementTransactions?: ISettlementTransaction[];
  pdfUrl?: string;

  store: SettlementStore;

  @observable checked = false;

  constructor(store: SettlementStore, entity: JsonConversions<ISettlement>) {
    super(entity);

    this.store = store;

    this.date = substituteLocalTimeZoneInsteadUTC(entity.date);
    this.pdfUrl = entity.pdfUrl;
    this.paymentGateway = camelCase(entity.paymentGateway) as PaymentGateway;
    this.fees = Number(entity.fees);
    this.amount = Number(entity.amount);
    this.adjustments = Number(entity.adjustments);
    this.count = Number(entity.count);
    this.mid = entity.mid;
    this.settlementTransactions = entity.settlementTransactions?.map(convertDates);
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
