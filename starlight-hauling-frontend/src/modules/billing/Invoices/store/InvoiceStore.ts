import { ApiError } from '@root/api/base/ApiError';
import { ActionCode } from '@root/helpers/notifications/types';
import * as Sentry from '@sentry/react';
import { sumBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { NotificationHelper } from '../../../../helpers';
import { BaseStore } from '../../../../stores/base/BaseStore';
import GlobalStore from '../../../../stores/GlobalStore';
import { InvoiceService } from '../api/invoice';
import { InvoicesByBuRequestBody } from '../types';

import { Invoice } from './Invoice';
import { CustomerRequestParams, InvoiceRequestParams, InvoiceSortType } from './types';

export class InvoiceStore extends BaseStore<Invoice, InvoiceSortType> {
  @observable count?: number;

  private readonly service: InvoiceService;

  constructor(global: GlobalStore) {
    super(global, 'ID', 'desc');
    this.service = new InvoiceService();
  }

  @actionAsync
  async request(
    businessUnitId: number,
    customerId?: number,
    subscriptionId?: number,
    { query, filters = {} }: InvoiceRequestParams = {},
  ) {
    this.loading = true;

    const requestBody: InvoicesByBuRequestBody = {
      businessUnitId,
      limit: this.limit,
      offset: this.offset,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
      filters,
      query,
      customerId: customerId ?? undefined,
      subscriptionId: subscriptionId ?? undefined,
    };

    try {
      const invoiceResponse = await task(this.service.getByBu(requestBody));

      this.count = invoiceResponse.invoicesCount;

      this.validateLoading(invoiceResponse.invoices, this.limit);

      this.setItems(invoiceResponse.invoices.map(invoice => new Invoice(this, invoice)));

      return invoiceResponse;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Invoice',
        data: {
          businessUnitId,
          query,
          filters,
        },
        message: `Invoice Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    } finally {
      this.offset += this.limit;
      this.loading = false;
    }
  }

  @actionAsync
  async requestByCustomer({ customerId, jobsiteId, query, filters = {} }: CustomerRequestParams) {
    this.loading = true;

    try {
      const invoiceResponse = await task(
        this.service.getByCustomer({
          customerId,
          filters,
          jobSiteId: jobsiteId,
          limit: this.limit,
          offset: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          query,
        }),
      );

      this.validateLoading(invoiceResponse.invoices, this.limit);

      this.setItems(invoiceResponse.invoices.map(invoice => new Invoice(this, invoice)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Invoice',
        data: {
          customerId,
          jobsiteId,
          query,
          filters,
        },
        message: `Invoice Request By Customer Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async requestDetailed(id: number, shouldOpenQuickView?: boolean) {
    if (this.quickViewLoading) {
      return;
    }
    this.quickViewLoading = true;
    try {
      const invoiceResponse = await task(
        this.service.getDetailedById({
          id,
        }),
      );

      if (invoiceResponse.invoice) {
        const invoice = new Invoice(this, invoiceResponse.invoice);
        invoice.checked = this.selectedEntity?.checked ?? false;

        this.setItem(invoice);
        this.updateSelectedEntity(invoice, shouldOpenQuickView);
        this.quickViewLoading = false;

        return invoice;
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Invoice',
        data: {
          id,
        },
        message: `Invoice Request Detailed Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.quickViewLoading = false;
  }

  @actionAsync
  async requestDetailedByOrderId(orderId: string) {
    if (this.quickViewLoading) {
      return;
    }
    this.quickViewLoading = true;

    try {
      const invoiceResponse = await task(
        this.service.getDetailedByOrderId({
          orderId,
        }),
      );

      if (invoiceResponse.order?.invoice) {
        const invoice = new Invoice(this, invoiceResponse.order.invoice);

        this.setItem(invoice);
        this.selectEntity(invoice);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Invoice',
        data: {
          orderId,
        },
        message: `Invoice Request Detailed by Order Id Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.quickViewLoading = false;
  }

  @actionAsync
  async requestDetailedBySubOrderId(orderId: string) {
    if (this.quickViewLoading) {
      return;
    }
    this.quickViewLoading = true;

    try {
      const invoiceResponse = await task(
        this.service.getDetailedBySubOrderId({
          orderId,
        }),
      );

      if (invoiceResponse?.invoiceBySubOrderId) {
        const invoice = new Invoice(this, invoiceResponse.invoiceBySubOrderId);

        this.setItem(invoice);
        this.selectEntity(invoice);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Invoice',
        data: {
          orderId,
        },
        message: `Invoice Request Detailed by SubOrder Id Error ${JSON.stringify(
          typedError?.message,
        )}`,
      });
      Sentry.captureException(typedError);
    }

    this.quickViewLoading = false;
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    try {
      const invoiceResponse = await task(
        this.service.getById({
          id,
        }),
      );

      if (invoiceResponse.invoice) {
        const invoice = new Invoice(this, invoiceResponse.invoice);

        this.selectEntity(invoice);
      }
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Invoice',
        data: {
          id,
        },
        message: `Invoice Request by Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
    this.loading = false;
  }

  @action checkAll(value: boolean) {
    this.values.forEach(invoices => (invoices.checked = value));
  }

  @computed get checkedInvoices() {
    return this.values.filter(invoices => invoices.checked);
  }

  @computed get isAllChecked() {
    const invoices = this.values;
    const { loading } = this;

    return this.checkedInvoices.length === invoices.length && invoices.length > 0 && !loading;
  }

  @computed get totalBalance() {
    const invoices = this.checkedInvoices;

    return sumBy(invoices, invoice => invoice.total);
  }
}
