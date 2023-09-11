import { action, observable } from 'mobx';

import { substituteLocalTimeZoneInsteadUTC } from '../../../../helpers';
import { BaseEntity } from '../../../../stores/base/BaseEntity';
import { IBusinessUnit, JsonConversions } from '../../../../types';
import { Payment } from '../../Payments/store/Payment';
import { GeneralPayment } from '../../Payments/types';
import { BankDepositStatus, BankDepositType, IBankDeposit } from '../types';

import { type BankDepositStore } from './BankDepositStore';

export class BankDeposit extends BaseEntity implements IBankDeposit {
  adjustments: number;
  date: Date;
  depositType: BankDepositType;
  synced: boolean;
  total: number;
  count: number;
  merchantId?: string;
  businessUnit?: IBusinessUnit;
  payments?: GeneralPayment[];

  store: BankDepositStore;

  @observable status: BankDepositStatus;

  @observable checked = false;

  constructor(store: BankDepositStore, entity: JsonConversions<IBankDeposit>) {
    super(entity);

    this.store = store;

    this.adjustments = entity.adjustments;
    this.merchantId = entity.merchantId;
    this.depositType = entity.depositType;
    this.status = entity.status;
    this.synced = entity.synced;
    this.total = Number(entity.total);
    this.count = Number(entity.count);
    this.date = substituteLocalTimeZoneInsteadUTC(entity.date);
    this.payments =
      entity.payments?.map(payment => new Payment(store.globalStore.paymentStore, payment)) ?? [];
  }

  @action.bound
  check() {
    this.checked = !this.checked;
  }
}
