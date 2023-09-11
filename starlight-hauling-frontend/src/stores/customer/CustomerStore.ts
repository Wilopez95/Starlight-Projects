import * as Sentry from '@sentry/react';
import { isEmpty } from 'lodash-es';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { CustomerGroupService, CustomerService } from '@root/api';
import { ApiError } from '@root/api/base/ApiError';
import { RequestQueryParams } from '@root/api/base/types';
import { INewCustomerData } from '@root/components/forms/NewCustomer/types';
import { CustomerStatus, PromiseStatusEnum } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  CustomerGroupType,
  CustomerStoreCountResponse,
  ICustomersOnHold,
  ICustomersResume,
} from '@root/types';
import {
  IBulkOnHoldRequest,
  IBulkResumeRequest,
  IChangeStatusRequest,
} from '@root/types/responseEntities';

import { BaseStore } from '../base/BaseStore';
import { Customer } from '../entities';
import type GlobalStore from '../GlobalStore';

import { formatDuplicatedFields } from './helpers';
import { sanitizeCustomer } from './sanitize';
import { CustomerRequestParams, CustomerStoreSortType, GetCountOptions } from './type';

export class CustomerStore extends BaseStore<Customer, CustomerStoreSortType> {
  private readonly service: CustomerService;
  private readonly groupService: CustomerGroupService;

  @observable isOpenEditQuickView = false;
  @observable deactivateCustomerError = false;
  @observable counts?: CustomerStoreCountResponse;
  @observable checkboxStatus = false;
  @observable isCommercial = false;

  constructor(global: GlobalStore) {
    super(global, 'id', 'asc');

    this.service = new CustomerService();
    this.groupService = new CustomerGroupService();
  }

  @action
  cleanup() {
    super.cleanup();
    this.deactivateCustomerError = false;
  }

  @action
  cleanDeactivateCustomerError() {
    this.deactivateCustomerError = false;
  }

  @actionAsync
  async request({
    businessUnitId,
    customerGroupId,
    query,
    filterData = {},
  }: CustomerRequestParams = {}) {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const customersResponse = await task(
        this.service.get({
          sortBy: this.sortBy,
          sortOrder: this.sortOrder,
          limit: this.limit,
          skip: this.offset,
          customerGroupId: customerGroupId === 'all' ? undefined : customerGroupId,
          businessUnitId,
          query,
          ...filterData,
        }),
      );

      this.validateLoading(customersResponse, this.limit);

      const customers = customersResponse.map(customer => new Customer(this, customer));

      this.setItems(customers);
      this.checkAll(this.checkboxStatus);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.loaded = true;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          businessUnitId,
          customerGroupId,
          query,
          filterData,
        },
        message: `Customers Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.offset += this.limit;
    this.loading = false;
  }

  @actionAsync
  async checkCustomerGroupType(customerGroupId: number): Promise<boolean> {
    try {
      const customerGroup = await task(this.groupService.getById(customerGroupId));
      const type = customerGroup?.type;
      const commercialTypes = [
        CustomerGroupType.commercial.toString(),
        CustomerGroupType.walkUp.toString(),
      ];
      const commercialCustomer = type ? commercialTypes.includes(type) : false;
      this.isCommercial = commercialCustomer;
      return commercialCustomer;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'CustomerGroup',
        data: {
          customerGroupId,
        },
        message: `Customer Group Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
      return false;
    }
  }

  @actionAsync
  async requestCount({ businessUnitId, query, filterData = {} }: GetCountOptions) {
    try {
      const [counts] = await task(
        Promise.all([
          this.service.getCount({ businessUnitId, query, ...filterData }),
          this.globalStore.customerGroupStore.request(),
        ]),
      );

      this.counts = counts;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          businessUnitId,
          query,
          filterData,
        },
        message: `Customers Count Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async create(data: INewCustomerData) {
    const sanitizedData = sanitizeCustomer(data);

    this.loading = true;

    if (this.counts) {
      this.counts.total++;
      this.counts.customerGroupIds[data.customerGroupId]++;
    }

    try {
      const newCustomer = await task(this.service.create(sanitizedData));

      const newCustomerEntity = new Customer(this, newCustomer);

      this.setItem(newCustomerEntity);
      this.selectEntity(newCustomerEntity);
      NotificationHelper.success('create', 'Customer');

      return newCustomerEntity;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('create', typedError?.response?.code as ActionCode, 'Customer');
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          ...data,
        },
        message: `Customers Create Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);

      if (this.counts) {
        this.counts.total--;
        this.counts.customerGroupIds[data.customerGroupId]--;
      }

      return null;
    } finally {
      this.loading = false;
    }
  }

  @actionAsync
  async update(data: INewCustomerData) {
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

      this.setItem(updatedCustomerEntity);
      this.selectEntity(updatedCustomerEntity, false);
      NotificationHelper.success('update', 'Customer');
    } catch (error: unknown) {
      const typedError = error as ApiError;
      this.validatePreconditionError(typedError);

      if (this.isPreconditionFailed) {
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        await this.requestById(data.id);
      } else {
        NotificationHelper.error('update', typedError?.response?.code as ActionCode, 'Customer');
      }
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          ...data,
        },
        message: `Customers Update Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @actionAsync
  async changeStatus(data: IChangeStatusRequest) {
    try {
      const customer = await task(this.service.changeStatus(data));
      const customerEntity = new Customer(this, customer);

      this.updateSelectedEntity(customerEntity);
      NotificationHelper.success('changeCustomerStatus');
    } catch (error: unknown) {
      const castedError = error as ApiError;

      if (castedError?.response?.code === ActionCode.CONFLICT) {
        this.deactivateCustomerError = true;
      } else {
        NotificationHelper.error('changeCustomerStatus', castedError.response.code as ActionCode);
      }

      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          ...data,
        },
        message: `Customers Change Status Error ${JSON.stringify(castedError.message)}`,
      });
      Sentry.captureException(castedError);
    }
  }

  @actionAsync
  async requestById(id: number, shouldOpenQuickView = false) {
    this.loading = true;
    let customer: Customer | null = null;

    try {
      const customerResponse = await task(this.service.getById(id));
      await this.checkCustomerGroupType(customerResponse.customerGroupId);
      customer = new Customer(this, customerResponse);
      this.setItem(customer);
      this.selectEntity(customer, shouldOpenQuickView);
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          id,
        },
        message: `Customers Request By Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;

    return customer;
  }

  @actionAsync
  async requestByJobSite({
    jobSiteId,
    businessUnitId,
    limit,
    skip,
  }: { jobSiteId: number; businessUnitId: string } & RequestQueryParams) {
    this.loading = true;
    try {
      const customerResponse = await task(
        this.service.requestByJobSite({ jobSiteId, businessUnitId, limit, skip }),
      );

      this.validateLoading(customerResponse, this.limit);
      this.setItems(customerResponse.map(customer => new Customer(this, customer)));
    } catch (error: unknown) {
      const typedError = error as ApiError;
      NotificationHelper.error('default', typedError?.response?.code as ActionCode);
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          jobSiteId,
          businessUnitId,
          limit,
          skip,
        },
        message: `Customers Request By Job Site Id Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }

    this.loading = false;
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
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Customer',
          data: {
            fields,
          },
          message: `Customers Check Duplicate Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }

    return false;
  }

  @actionAsync
  async bulkOnHold(ids: Array<number>, data: ICustomersOnHold) {
    if (!isEmpty(ids)) {
      try {
        const requestBody: IBulkOnHoldRequest = {
          ids,
          ...data,
        };
        const response = await task(this.service.bulkPutOnHold(requestBody));

        const fulfilledCustomers: Array<Customer> = [];

        response.forEach(item => {
          if (item.status === PromiseStatusEnum.FULFILLED && item.value) {
            fulfilledCustomers.push(new Customer(this, item.value));
          }

          if (item.status === PromiseStatusEnum.REJECTED) {
            NotificationHelper.error('default', item.reason as unknown as ActionCode);
            Sentry.addBreadcrumb({
              category: 'Customer',
              data: {
                reason: item.reason,
              },
              message: `Customers Bulk On Hold Error ${JSON.stringify(item.reason)}`,
            });
            Sentry.captureException(item.reason);
          }
        });

        this.setItems(fulfilledCustomers);
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Customer',
          data: {
            ids,
          },
          message: `Customers Bulk On Hold Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  @actionAsync
  async bulkResume(ids: Array<number>, data: ICustomersResume) {
    if (!isEmpty(ids)) {
      try {
        const requestBody: IBulkResumeRequest = {
          ids,
          ...data,
        };

        const response = await task(this.service.bulkResume(requestBody));

        const fulfilledCustomers: Array<Customer> = [];

        response.forEach(item => {
          if (item.status === PromiseStatusEnum.FULFILLED && item.value) {
            fulfilledCustomers.push(new Customer(this, item.value));
          }

          if (item.status === PromiseStatusEnum.REJECTED) {
            NotificationHelper.error('default', item.reason as unknown as ActionCode);
            Sentry.addBreadcrumb({
              category: 'Customer',
              data: {
                reason: item.reason,
              },
              message: `Customers Bulk Resume Error ${JSON.stringify(item.reason)}`,
            });
            Sentry.captureException(item.reason);
          }
        });

        this.setItems(fulfilledCustomers);
      } catch (error: unknown) {
        const typedError = error as ApiError;
        NotificationHelper.error('default', typedError?.response?.code as ActionCode);
        Sentry.addBreadcrumb({
          category: 'Customer',
          data: {
            ids,
          },
          message: `Customers Bulk Resume Error ${JSON.stringify(typedError?.message)}`,
        });
        Sentry.captureException(typedError);
      }
    }
  }

  getSelectedTabSize(customerGroup: string) {
    if (!this.counts) {
      return 0;
    }

    if (customerGroup === 'all') {
      return this.counts.filteredTotal;
    }

    return this.counts.customerGroupIds[customerGroup] ?? 0;
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

  @action checkAll(value: boolean) {
    this.checkboxStatus = value;
    this.values.forEach(customer => (customer.checked = value));
  }

  @action disabledBulkUpdateButton(status: CustomerStatus) {
    return !this.checkedCustomers.find(customer => customer.status === status);
  }

  @computed get checkedCustomers() {
    return this.values.filter(customer => customer.checked);
  }

  @computed get isAllChecked() {
    const customers = this.values;
    const loading = this.loading;

    return customers.length > 0 && !loading && this.checkedCustomers.length === customers.length;
  }

  @computed get selectedCustomersSubscriptionsCount() {
    const customers = this.checkedCustomers;

    return customers.reduce((prev, cur) => prev + (cur.activeSubscriptionsCount ?? 0), 0);
  }

  @computed get availableSelectedCustomersSubscriptions() {
    return this.selectedCustomersSubscriptionsCount > 0;
  }
}
