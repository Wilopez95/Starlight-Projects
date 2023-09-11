import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { ActionCode } from '@root/helpers/notifications/types';

import { type ApiError } from '../../../../api/base/ApiError';
import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { type SortType } from '../../../../types';
import { PaymentService } from '../api/payment';
import { NewUnappliedPayment, PaymentApplication, ReverseData, WriteOffParams } from '../types';

import { Payment } from './Payment';
import { sanitizePayment, sanitizePaymentApplication } from './sanitize';
import { type DeferredPaymentSortType, type PaymentSortType, type RequestOptions } from './types';

export class PaymentStore extends BaseStore<Payment, PaymentSortType> {
  private readonly service: PaymentService;
  @observable memoPaymentCreating = false;
  @observable writeOffCreating = false;
  @observable onlyDeferredFailed = false;
  @observable deferredSortBy: DeferredPaymentSortType = 'DEFERRED_UNTIL';

  @observable count?: number;

  constructor(global: GlobalStore) {
    super(global, 'DATE', 'desc');
    this.service = new PaymentService();
  }

  @actionAsync
  async writeOffInvoices({ invoiceIds, customerId, note, date }: WriteOffParams) {
    try {
      await task(this.service.writeOffInvoices({ invoiceIds, customerId, note, date }));

      const customer = this.globalStore.customerStore.selectedEntity;

      customer?.requestBalances();

      return true;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }
  }

  @actionAsync
  async requestByCustomer(customerId: number, options?: RequestOptions) {
    this.loading = true;

    try {
      const paymentResponse = await task(
        this.service.getPayments({
          customerId,
          ...options,

          sortBy: this.sortBy === 'DEPOSIT' ? 'DATE' : this.sortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          offset: this.offset,
        }),
      );

      this.validateLoading(paymentResponse.payments, this.limit);

      this.setItems(paymentResponse.payments.map(payment => new Payment(this, payment)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          customerId,
          ...options,
        },
        message: `Payments Request By Customer Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestByBU(businessUnitId: number, options?: RequestOptions) {
    this.loading = true;

    try {
      const paymentResponse = await task(
        this.service.getPayments({
          businessUnitId,
          ...options,

          sortBy: this.sortBy === 'DEPOSIT' ? 'DATE' : this.sortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          offset: this.offset,
        }),
      );

      this.validateLoading(paymentResponse.payments, this.limit);

      this.setItems(paymentResponse.payments.map(payment => new Payment(this, payment)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          businessUnitId,
          ...options,
        },
        message: `Payments Request By BU Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async requestDeferredByBU(businessUnitId: number) {
    this.loading = true;

    try {
      const paymentResponse = await task(
        this.service.getDeferred({
          businessUnitId,
          failedOnly: this.onlyDeferredFailed,

          sortBy: this.deferredSortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          offset: this.offset,
        }),
      );

      this.validateLoading(paymentResponse.deferredPayments, this.limit);
      this.setItems(paymentResponse.deferredPayments.map(payment => new Payment(this, payment)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          businessUnitId,
        },
        message: `Payments Request Deferred By BU Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
    this.offset += this.limit;
  }

  @actionAsync
  async chargeDeferredPayment(paymentId: number, businessUnitId: number) {
    try {
      await task(this.service.chargeDeferredById({ paymentId }));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError.response.code as ActionCode);
    }

    if (this.values.length) {
      this.cleanup();
      this.requestDeferredByBU(businessUnitId);
    }
  }

  @actionAsync
  async chargeDeferredPayments(paymentIds: number[], businessUnitId: number) {
    try {
      await task(this.service.chargeDeferredPayments({ paymentIds }));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          paymentIds,
          businessUnitId,
        },
        message: `Payments Request Deferred By BU Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.cleanup();
      this.requestDeferredByBU(businessUnitId);
    }
  }

  @actionAsync
  async requestDetailed(paymentId: number) {
    if (this.quickViewLoading) {
      return;
    }

    this.quickViewLoading = true;
    try {
      const paymentResponse = await task(this.service.getDetailedById(paymentId));

      if (paymentResponse.payment) {
        const newPayment = new Payment(this, paymentResponse.payment);

        this.setItem(newPayment);
        this.updateSelectedEntity(newPayment);

        this.quickViewLoading = false;

        return newPayment;
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          paymentId,
        },
        message: `Payments Request Detailed Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.quickViewLoading = false;

    return null;
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

      NotificationHelper.success('create', 'Payment');

      return newPayment;
    } catch (error: unknown) {
      const castedError = error as ApiError;

      if ((castedError?.response?.code as ActionCode) === ActionCode.PRECONDITION_FAILED) {
        NotificationHelper.error('createUnappliedPayment', ActionCode.PRECONDITION_FAILED);
        Sentry.addBreadcrumb({
          category: 'Payment',
          data: {
            ...newPaymentData,
          },
          message: `PRECONDITION_FAILED`,
          level: 'warning',
        });
        Sentry.captureException(castedError);
      } else {
        NotificationHelper.error(
          'create',
          castedError?.response?.code as ActionCode,
          'Unapplied Payment',
        );
        Sentry.addBreadcrumb({
          category: 'Payment',
          data: {
            ...newPaymentData,
          },
          message: `Payments Create Unapplied Error ${JSON.stringify(castedError?.message)}`,
        });
        Sentry.captureException(castedError);
      }
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
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('applyPaymentManually', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          paymentId,
          application,
        },
        message: `Payments Apply Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async reversePayment(paymentId: number, reverseData: ReverseData) {
    try {
      const response = await task(this.service.reversePayment(paymentId, reverseData));

      if (response.reversePayment) {
        const reversePayment = new Payment(this, response.reversePayment);

        this.setItem(reversePayment);
        this.selectEntity(reversePayment);
      }
      NotificationHelper.success('reversePayment');
      this.globalStore.customerStore.selectedEntity?.requestBalances();
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('reversePayment', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          paymentId,
          ...reverseData,
        },
        message: `Payments Reverse Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async refundUnappliedPayment(paymentId: number, amount: number) {
    try {
      const response = await task(this.service.refundUnappliedPayment(paymentId, amount));

      if (response.refundUnappliedPayment) {
        const refundPayment = new Payment(this, response.refundUnappliedPayment);

        this.setItem(refundPayment);
        this.selectEntity(refundPayment);
      }
      NotificationHelper.success('refundUnappliedPayment');
      this.globalStore.customerStore.selectedEntity?.requestBalances();
    } catch (error: unknown) {
      const castedError = error as ApiError;

      if (castedError?.response?.errors?.find(err => err?.extensions?.details === 412)) {
        NotificationHelper.error('refundUnappliedPayment', ActionCode.PRECONDITION_FAILED);
        Sentry.addBreadcrumb({
          category: 'Payment',
          data: {
            paymentId,
            amount,
          },
          message: ActionCode.PRECONDITION_FAILED,
          level: 'warning',
        });
        Sentry.captureException(castedError);
      } else {
        NotificationHelper.error(
          'refundUnappliedPayment',
          castedError?.response?.code as ActionCode,
        );
        Sentry.addBreadcrumb({
          category: 'Payment',
          data: {
            paymentId,
            amount,
          },
          message: `Payments Refund Unapplied Error ${JSON.stringify(castedError?.message)}`,
        });
        Sentry.captureException(castedError);
      }
    }
  }

  @actionAsync
  async deleteMemoPayment(paymentId: number) {
    try {
      const customer = this.globalStore.customerStore.selectedEntity;

      if (!customer) {
        return;
      }

      await task(this.service.deleteCreditMemoPayment(paymentId));

      this.removeEntity(paymentId);
      NotificationHelper.success('delete', 'Payment');
      this.unSelectEntity();
      this.globalStore.customerStore.selectedEntity?.requestBalances();
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('delete', typedError?.response?.code as ActionCode, 'Payment');
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          paymentId,
        },
        message: `Payments Delete Memo Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async updateMemoPayment(paymentData: NewUnappliedPayment) {
    try {
      const payment = this.selectedEntity;

      if (!payment) {
        return;
      }

      const updatedPaymentResponse = await task(
        this.service.editCreditMemoPayment(payment.id, sanitizePayment(paymentData)),
      );

      const updatedPayment = new Payment(this, updatedPaymentResponse);

      this.setItem(updatedPayment);
      this.globalStore.customerStore.selectedEntity?.requestBalances();

      NotificationHelper.success('update', 'Credit Memo Payment');
      this.unSelectEntity();
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error(
        'update',
        typedError?.response?.code as ActionCode,
        'Credit Memo Payment',
      );
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          ...paymentData,
        },
        message: `Payments Update Memo Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async getLatestOrderPayment(orderId: number): Promise<Payment | null> {
    try {
      const response = await task(this.service.getLatestOrderPayment(orderId));

      if (response.prepaidPayment) {
        return new Payment(this, response.prepaidPayment);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Payment',
        data: {
          orderId,
        },
        message: `Payments Get Latest Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    return null;
  }

  @action toggleOnlyDeferredFailed() {
    const currentOnlyDeferredFailed = this.onlyDeferredFailed;

    this.cleanup();
    this.onlyDeferredFailed = !currentOnlyDeferredFailed;
  }

  @action checkAllDeferred(value: boolean) {
    this.values
      .filter(({ status }) => status === 'deferred')
      .forEach(payment => (payment.checked = value));
  }

  @computed get checkedPayments() {
    return this.values.filter(payment => payment.checked);
  }

  @computed get deferredPayments() {
    return this.values.filter(({ status }) => status === 'deferred');
  }

  @computed get isAllDeferredChecked() {
    const loading = this.loading;

    return (
      this.checkedPayments.length === this.deferredPayments.length &&
      this.deferredPayments.length > 0 &&
      !loading
    );
  }

  @action.bound
  openWriteOffQuickView() {
    this.toggleQuickView(true);
    this.writeOffCreating = true;
  }

  @action.bound
  openCreateMemoQuickView() {
    this.toggleQuickView(true);
    this.memoPaymentCreating = true;
  }

  @action.bound
  closeQuickView() {
    this.toggleQuickView(false);
    this.memoPaymentCreating = false;
    this.writeOffCreating = false;
  }

  @action.bound
  setDeferredSort(sortBy: DeferredPaymentSortType, sortOrder: SortType) {
    this.cleanup();
    this.sortOrder = sortOrder;
    this.deferredSortBy = sortBy;
  }

  @action cleanup() {
    super.cleanup();
    this.memoPaymentCreating = false;
    this.writeOffCreating = false;
    this.onlyDeferredFailed = false;
  }
}
