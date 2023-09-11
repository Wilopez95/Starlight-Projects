import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';
import { NotificationHelper } from '@root/core/helpers';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { SortType } from '@root/core/types';
import { PaymentService } from '@root/finance/api/payment/payment';
import { NewUnappliedPayment, PaymentApplication } from '@root/finance/types/entities';

import { Payment } from './Payment';
import { sanitizePayment, sanitizePaymentApplication } from './sanitize';
import type { PaymentSortType, RequestOptions } from './types';

export class PaymentStore extends BaseStore<Payment> {
  private readonly service: PaymentService;
  @observable memoPaymentCreating = false;
  @observable writeOffCreating = false;
  @observable onlyDeferredFailed = false;
  @observable sortBy: PaymentSortType = 'DATE';
  @observable deferredSortBy: PaymentSortType = 'DEFERRED_UNTIL';
  @observable sortOrder: SortType = 'desc';
  @observable count?: number;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new PaymentService();
  }

  @action.bound
  closeQuickView() {
    this.toggleQuickView(false);
    this.memoPaymentCreating = false;
    this.writeOffCreating = false;
  }

  @actionAsync
  async requestByCustomer(customerId: number, options?: RequestOptions) {
    this.loading = true;

    try {
      const paymentResponse = await task(
        this.service.getPayments({
          customerId,
          ...options,

          sortBy: this.sortBy,
          sortOrder: this.sortOrder.toUpperCase() as 'ASC' | 'DESC',
          limit: this.limit,
          offset: this.offset,
        }),
      );

      this.validateLoading(paymentResponse.payments, this.limit);

      this.setItems(paymentResponse.payments.map((payment) => new Payment(this, payment)));
    } catch (error) {
      console.error('Payments Request Error', error);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async createUnappliedPayment(newPaymentData: NewUnappliedPayment) {
    try {
      const customer = this.globalStore.customerStore.selectedEntity;

      if (!customer) {
        return;
      }

      const newPaymentResponse = await task(
        this.service.createUnappliedPayment(customer.id, sanitizePayment(newPaymentData)),
      );

      customer.requestBalances();

      if (
        newPaymentData.paymentType === 'creditCard' &&
        newPaymentData.newCreditCard &&
        newPaymentResponse.creditCard
      ) {
        this.globalStore.creditCardStore.requestById(String(newPaymentResponse.creditCard.id));
      }

      const newPayment = new Payment(this, newPaymentResponse);

      this.setItem(newPayment);

      NotificationHelper.success('createUnappliedPayment');

      return newPayment;
    } catch (error) {
      NotificationHelper.error('payment', error?.response?.code);
    }
  }

  @actionAsync
  async applyPayment(paymentId: number, application: PaymentApplication[]) {
    try {
      const response = await task(
        this.service.applyPaymentManually(paymentId, sanitizePaymentApplication(application)),
      );

      if (response.applyPayment) {
        this.setItem(new Payment(this, response.applyPayment));
      }
      NotificationHelper.success('applyPaymentManually');
      this.globalStore.customerStore.selectedEntity?.requestBalances();
    } catch (error) {
      NotificationHelper.error('payment', error?.response?.code);
    }
  }

  @computed get checkedPayments() {
    return this.values.filter((payment) => payment.checked);
  }

  @computed get deferredPayments() {
    return this.values.filter(({ status }) => status === 'deferred');
  }
}
