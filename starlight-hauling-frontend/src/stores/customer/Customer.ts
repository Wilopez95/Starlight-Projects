import * as Sentry from '@sentry/react';
import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { CustomerService } from '@root/api';
import { AutopayEnum, BillingCycleEnum, CustomerStatus } from '@root/consts';
import { addressFormat, convertDates } from '@root/helpers';
import { convertPurchaseOrderDates } from '@root/stores/subscription/helpers';
import { IPurchaseOrder, JsonConversions } from '@root/types';
import {
  AprType,
  CustomerGroupType,
  IAddress,
  IBroker,
  ICustomer,
  InvoiceConstruction,
  IPhoneNumber,
  PaymentTerms,
} from '@root/types/entities';
import { IResponseCustomer } from '@root/types/responseEntities';

import { ApiError } from '@root/api/base/ApiError';
import { BaseEntity } from '../base/BaseEntity';

import { CustomerStore } from './CustomerStore';
import { ICustomerBalances } from './type';

export class Customer extends BaseEntity implements ICustomer {
  @observable balance: number;

  @observable balances: ICustomerBalances | undefined;

  @observable creditLimit?: number;

  @observable checked = false;

  customerGroupId: number;

  email: string;

  signatureRequired: boolean;

  poRequired: boolean;

  firstName: string;

  lastName: string;

  businessName: string;

  businessUnitId: number;

  alternateId: string | null;

  invoiceConstruction: InvoiceConstruction;

  sendInvoicesByEmail: boolean;

  sendInvoicesByPost: boolean;

  attachTicketPref: boolean;

  attachMediaPref: boolean;

  statementEmails: string[];

  notificationEmails: string[];

  onAccount: boolean;

  billingCycle: BillingCycleEnum;

  paymentTerms: PaymentTerms;

  addFinanceCharges: boolean;

  aprType: AprType;

  mailingAddress: IAddress;

  billingAddress: IAddress;

  generalNote: string;

  popupNote: string;

  billingNote: string;

  workOrderNote: string;

  status: CustomerStatus;

  financeCharge: number | null;

  spUsed: boolean;

  fullName: string;

  invoiceEmails?: string[];

  ownerId?: number;

  salesId?: number;

  phoneNumbers: IPhoneNumber[];

  walkup?: boolean;

  isAutopayExist?: boolean;

  autopayType?: AutopayEnum;

  autopayCreditCardId?: string | number;

  mainFirstName?: string;

  mainLastName?: string;

  mainEmail?: string;

  mainPhoneNumbers?: IPhoneNumber[];

  mainJobTitle?: string | null;

  contactId?: number;

  owner?: IBroker;

  workOrderRequired: boolean;

  jobSiteRequired: boolean;

  canTareWeightRequired: boolean;

  gradingRequired: boolean;

  gradingNotification: boolean;

  selfServiceOrderAllowed: boolean;

  mainCustomerPortalUser?: boolean;

  customerPortalUser?: boolean;

  purchaseOrders?: IPurchaseOrder[] | null;

  activeSubscriptionsCount?: number;

  store: CustomerStore;

  constructor(store: CustomerStore, entity: JsonConversions<IResponseCustomer>) {
    super(entity);

    this.store = store;
    this.customerGroupId = entity.customerGroupId;
    this.email = entity.email;
    this.signatureRequired = entity.signatureRequired;
    this.poRequired = entity.poRequired;
    this.purchaseOrders = entity.purchaseOrders?.map(convertPurchaseOrderDates);
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.businessName = entity.businessName ?? '';
    this.businessUnitId = entity.businessUnitId;
    this.alternateId = entity.alternateId;
    this.ownerId = entity.ownerId;
    this.salesId = entity.salesId;
    this.phoneNumbers = entity.phoneNumbers;
    this.mainFirstName = entity.mainFirstName;
    this.mainLastName = entity.mainLastName;
    this.mainEmail = entity.mainEmail;
    this.mainPhoneNumbers = entity.mainPhoneNumbers;
    this.mainJobTitle = entity.mainJobTitle;
    this.invoiceConstruction = entity.invoiceConstruction;
    this.onAccount = entity.onAccount;
    this.creditLimit = entity.creditLimit;
    this.billingCycle = entity.billingCycle;
    this.paymentTerms = entity.paymentTerms;
    this.addFinanceCharges = entity.addFinanceCharges;
    this.aprType = entity.aprType;
    this.financeCharge = entity.financeCharge;
    this.mailingAddress = entity.mailingAddress;
    this.billingAddress = entity.billingAddress;
    this.generalNote = entity.generalNote;
    this.popupNote = entity.popupNote;
    this.billingNote = entity.billingNote;
    this.workOrderNote = entity.workOrderNote;
    this.balance = entity.balance;
    this.contactId = entity.contactId;
    this.sendInvoicesByPost = entity.sendInvoicesByPost;
    this.sendInvoicesByEmail = entity.sendInvoicesByEmail;
    this.attachMediaPref = entity.attachMediaPref;
    this.attachTicketPref = entity.attachTicketPref;
    this.fullName = entity.name;
    this.invoiceEmails = entity.invoiceEmails;
    this.statementEmails = entity.statementEmails;
    this.notificationEmails = entity.notificationEmails;
    this.workOrderRequired = entity.workOrderRequired;
    this.jobSiteRequired = entity.jobSiteRequired;
    this.canTareWeightRequired = entity.canTareWeightRequired;
    this.gradingRequired = entity.gradingRequired;
    this.gradingNotification = entity.gradingNotification;
    this.selfServiceOrderAllowed = entity.selfServiceOrderAllowed;
    this.owner = convertDates(entity.owner);
    this.status = entity.status;
    this.walkup = entity.walkup;
    this.isAutopayExist = entity.isAutopayExist;
    this.autopayType = entity.autopayType;
    this.autopayCreditCardId = entity.autopayCreditCardId;
    this.mainCustomerPortalUser = entity.mainCustomerPortalUser;
    this.customerPortalUser = entity.customerPortalUser;
    this.spUsed = entity.spUsed;
    this.activeSubscriptionsCount = entity.activeSubscriptionsCount;
  }

  @actionAsync
  async requestBalances() {
    try {
      const { customerBalances } = await task(CustomerService.getBalances(this.id));

      this.balances = customerBalances;
      this.balance = customerBalances.balance;
    } catch (error: unknown) {
      const typedError = error as ApiError;
      Sentry.addBreadcrumb({
        category: 'Customer',
        data: {
          id: this.id,
        },
        message: `Customer Balances Request Error ${JSON.stringify(typedError?.message)}`,
      });
      Sentry.captureException(typedError);
    }
  }

  @computed
  get salesRep() {
    return this.store.globalStore.userStore.getById(this.salesId);
  }

  @computed
  get customerGroup() {
    return this.store.globalStore.customerGroupStore.getById(this.customerGroupId);
  }

  @computed
  get name() {
    return this.businessName || `${this.fullName}`;
  }

  @computed
  get phone() {
    const { customerGroup } = this;

    if (!customerGroup) {
      return null;
    }

    const phones =
      customerGroup.type === CustomerGroupType.commercial
        ? this.mainPhoneNumbers
        : this.phoneNumbers;

    return phones?.find(phoneNumber => phoneNumber.type === 'main') ?? null;
  }

  @computed
  get contactPerson() {
    const { customerGroup } = this;

    if (!customerGroup) {
      return null;
    }

    if ([CustomerGroupType.commercial, CustomerGroupType.walkUp].includes(customerGroup.type)) {
      return `${this.mainFirstName as string} ${this.mainLastName as string}`;
    }

    return `${this.firstName} ${this.lastName}`;
  }

  @computed
  get formattedBillingAddress() {
    return addressFormat(this.billingAddress);
  }

  @action.bound check() {
    this.checked = !this.checked;
  }
}
