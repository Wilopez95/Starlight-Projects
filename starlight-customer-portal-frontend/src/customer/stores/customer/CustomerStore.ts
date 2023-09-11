import { isEmpty } from 'lodash-es';
import { action, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import type GlobalStore from '@root/app/GlobalStore';
import { NotificationHelper } from '@root/core/helpers';
import { BaseStore } from '@root/core/stores/base/BaseStore';
import { CustomerService } from '@root/customer/api/customer/customer';
import { IEditCustomerData } from '@root/customer/forms/EditCustomer/types';
import { Customer } from '@root/customer/stores/customer/Customer';
import { sanitizeCustomer } from '@root/customer/stores/customer/sanitize';

import { formatDuplicatedFields } from './helpers';

export class CustomerStore extends BaseStore<Customer> {
  private readonly service: CustomerService;

  @observable isOpenEditQuickView = false;

  constructor(global: GlobalStore) {
    super(global);

    this.service = new CustomerService();
  }

  @action
  toggleEditQuickView(value?: boolean): void {
    if (typeof value === 'undefined') {
      this.isOpenEditQuickView = !this.isOpenEditQuickView;

      return;
    }
    this.clearPreconditionFailedError();
    this.isOpenEditQuickView = value;
  }

  @actionAsync
  async request() {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const customersResponse = await task(this.service.get());

      this.validateLoading(customersResponse, customersResponse.length);

      const customers = customersResponse.map((customer) => new Customer(this, customer as any));

      this.setItems(customers);
    } catch (error) {
      console.error('Customer Request Error:', error);
    }

    this.loading = false;
  }

  @action
  setItemById(id: number) {
    const entity = this.getById(id);

    if (entity) {
      this.selectEntity(entity);
    }
  }

  @actionAsync
  async checkDuplicate(fields: Partial<Customer>) {
    if (!isEmpty(fields)) {
      try {
        const duplicatedFields = await task(this.service.checkDuplicate(fields));

        if (duplicatedFields) {
          return {
            duplicatedFields,
            duplicatedFieldName: formatDuplicatedFields(Object.keys(duplicatedFields)).toString(),
          };
        }
      } catch (error) {
        console.error('Check duplicate Error:', error);
      }
    }

    return false;
  }

  @actionAsync
  async update(data: IEditCustomerData) {
    const sanitizedData = sanitizeCustomer(data);

    try {
      this.clearPreconditionFailedError();
      const newCustomer = await task(
        this.service.update(data.id, {
          ...sanitizedData,
          updatedAt: this.selectedEntity?.updatedAt,
        }),
      );

      const updatedCustomerEntity = new Customer(this, newCustomer);

      if (this.selectedEntity?.customerGroup) {
        updatedCustomerEntity.customerGroup = this.selectedEntity.customerGroup;
      }

      if (!newCustomer.businessUnit && this.selectedEntity) {
        updatedCustomerEntity.businessUnit = this.selectedEntity.businessUnit;
      }

      this.setItem(updatedCustomerEntity);
      this.selectEntity(updatedCustomerEntity, false);

      NotificationHelper.success('editCustomer');
    } catch (error) {
      this.validatePreconditionError(error);

      if (this.isPreconditionFailed) {
        NotificationHelper.error('customer', error?.response?.code);

        await this.requestById(data.id);
      } else {
        NotificationHelper.custom('error', error?.response?.message);
      }
      console.error('Customer Update Error', error);
    }
  }

  @actionAsync
  async requestById(id: number) {
    this.loading = true;
    let customer: Customer | null = null;

    try {
      const balances = this.selectedEntity?.balances;
      const customerResponse = await task(this.service.getById(id));

      customer = new Customer(this, customerResponse as any);
      customer.balances = balances;
      this.setItem(customer);
      this.selectEntity(customer);
    } catch (error) {
      console.error('Customer Request By Id Error:', error);
    }

    this.loading = false;

    return customer;
  }
}
