import { sumBy } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import GlobalStore from '@root/app/GlobalStore';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { SortType } from '@root/core/types';
import { InvoiceService } from '@root/finance/api/invoice/invoice';
import { InvoiceStatusEnum } from '@root/finance/types/entities';

import { Invoice } from './Invoice';
import { CustomerRequestParams, InvoiceSortType } from './types';

export class InvoiceStore extends BaseStore<Invoice> {
  @observable sortBy: InvoiceSortType = 'ID';
  @observable sortOrder: SortType = 'asc';
  @observable count?: number;
  @observable showOpenOnly = false;
  @observable query = ''; // todo: remove after implementing invoice filters

  private readonly service: InvoiceService;

  constructor(global: GlobalStore) {
    super(global);
    this.service = new InvoiceService();
  }

  @action
  setShowOnlyOpen(newValue: boolean) {
    this.showOpenOnly = newValue;
    this.cleanup();
  }

  @action
  setQuery(newValue: string) {
    this.query = newValue;
    this.cleanup();
  }

  @action
  cleanup() {
    super.cleanup();
    this.count = 0;
  }

  @actionAsync
  async request({ customerId, jobsiteId, filters = {} }: CustomerRequestParams) {
    this.loading = true;
    if (this.showOpenOnly) {
      // overdue invoices are also open
      filters.filterByStatus = [InvoiceStatusEnum.open, InvoiceStatusEnum.overdue];
    }

    try {
      const invoiceResponse = await task(
        this.service.getByCustomer({
          customerId,
          filters,
          jobSiteId: jobsiteId,
          limit: this.limit,
          offset: this.offset,
          sortBy: this.sortBy,
          sortOrder: this.sortOrder.toUpperCase() as 'ASC' | 'DESC',
          query: this.query,
        }),
      );

      this.count = invoiceResponse.invoicesCount;

      this.validateLoading(invoiceResponse.invoices, this.limit);

      this.setItems(invoiceResponse.invoices.map((invoice) => new Invoice(this, invoice)));
    } catch (error) {
      this.loaded = true;
    }
    this.offset += this.limit;
    this.loading = false;
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
    } catch (error) {
      console.error('Invoice Request Error', error);
    }
    this.loading = false;
  }

  @action checkAll(value: boolean) {
    this.values.forEach((invoices) => (invoices.checked = value));
  }

  @computed get checkedInvoices() {
    return this.values.filter((invoices) => invoices.checked);
  }

  @computed get isAllChecked() {
    const invoices = this.values;
    const loading = this.loading;

    return this.checkedInvoices.length === invoices.length && invoices.length > 0 && !loading;
  }

  @action.bound
  setSort(sortBy: InvoiceSortType, sortOrder: SortType) {
    this.sortOrder = sortOrder;
    this.sortBy = sortBy;
  }

  @computed get totalBalance() {
    const invoices = this.checkedInvoices;

    return sumBy(invoices, (invoice) => invoice.balance);
  }

  @actionAsync
  async requestDetailed(id: number) {
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

        this.setItem(invoice);
        this.updateSelectedEntity(invoice);
        this.quickViewLoading = false;

        return invoice;
      }
    } catch (error) {
      console.error('Invoice Request Error', error);
    }
    this.quickViewLoading = false;
  }
}
