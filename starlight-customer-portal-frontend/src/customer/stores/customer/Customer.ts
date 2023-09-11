import { action, computed, observable } from 'mobx';
import { actionAsync, task } from 'mobx-utils';

import { addressFormat, convertDates } from '@root/core/helpers';
import { BaseEntity } from '@root/core/stores/base/BaseEntity';
import {
  CustomerGroupType,
  IBusinessUnit,
  ICustomerGroup,
  JsonConversions,
} from '@root/core/types';
import { IAddress } from '@root/core/types/entities';
import { IResponseCustomer } from '@root/core/types/responseEntities';
import { ICustomerBalances } from '@root/customer/stores/customer/type';
import { ICustomer } from '@root/customer/types';
import { BalancesService } from '@root/finance/api/balances/balances';

import { CustomerStore } from './CustomerStore';

export class Customer extends BaseEntity implements ICustomer {
  @observable balance: number;
  @observable balances: ICustomerBalances | undefined;
  @observable creditLimit?: number;
  @observable checked = false;

  customerGroupId: number;
  customerGroup: ICustomerGroup;
  email: string;
  signatureRequired: boolean;
  poRequired: boolean;
  firstName: string;
  lastName: string;
  businessName: string;
  businessUnitId: number;
  alternateId: string | null;
  invoiceConstruction: any; // todo: define type
  sendInvoicesByEmail: boolean;
  sendInvoicesByPost: boolean;
  attachTicketPref: boolean;
  attachMediaPref: boolean;
  invoiceEmails: string[];
  statementEmails: string[];
  notificationEmails: string[];
  onAccount: boolean;
  billingCycle: any; // todo: define type
  paymentTerms: any; // todo: define type
  addFinanceCharges: boolean;
  aprType: any; // todo: define type
  mailingAddress: IAddress;
  billingAddress: IAddress;
  generalNote: string;
  popupNote: string;
  onHold: boolean;
  financeCharge: number | null;
  phoneNumbers: any[]; // todo: define type
  contactId?: number;
  mainFirstName?: string;
  mainLastName?: string;
  mainEmail?: string;
  mainPhoneNumbers?: any[]; // todo: define type
  mainJobTitle?: string | null;
  owner?: any; // todo: define type
  ownerId?: number;
  salesId?: number;
  mainCustomerPortalUser?: boolean;
  customerPortalUser?: boolean;
  businessUnit: IBusinessUnit;

  store: CustomerStore;

  constructor(store: CustomerStore, entity: JsonConversions<IResponseCustomer>) {
    super(entity);

    this.store = store;
    this.customerGroupId = entity.customerGroupId;
    this.customerGroup = convertDates(entity.customerGroup);
    this.email = entity.email;
    this.signatureRequired = entity.signatureRequired;
    this.poRequired = entity.poRequired;
    this.firstName = entity.firstName;
    this.lastName = entity.lastName;
    this.businessName = entity.businessName;
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
    this.balance = entity.balance;
    this.contactId = entity.contactId;
    this.sendInvoicesByPost = entity.sendInvoicesByPost;
    this.sendInvoicesByEmail = entity.sendInvoicesByEmail;
    this.attachMediaPref = entity.attachMediaPref;
    this.attachTicketPref = entity.attachTicketPref;
    this.invoiceEmails = entity.invoiceEmails;
    this.statementEmails = entity.statementEmails;
    this.notificationEmails = entity.notificationEmails;
    this.onHold = entity.onHold;
    this.mainCustomerPortalUser = entity.mainCustomerPortalUser;
    this.customerPortalUser = entity.customerPortalUser;

    this.owner = convertDates(entity.owner);

    // todo: move BU to its own store for any additional interaction
    this.businessUnit = convertDates(entity.businessUnit);
  }

  @computed
  get name() {
    return this.businessName ?? `${this.firstName} ${this.lastName}`;
  }

  @computed
  get formattedBillingAddress() {
    return addressFormat(this.billingAddress);
  }

  @action.bound check() {
    this.checked = !this.checked;
  }

  @computed
  get contactPerson() {
    if (!this.customerGroup) {
      return undefined;
    }

    if (this.customerGroup.type === CustomerGroupType.commercial) {
      return `${this.mainFirstName as string} ${this.mainLastName as string}`;
    }

    return `${this.firstName} ${this.lastName}`;
  }

  @actionAsync
  async requestBalances() {
    try {
      const { customerBalances } = await task(BalancesService.getCustomerBalance(this.id));

      this.balances = customerBalances;
      this.balance = customerBalances.balance;
    } catch (error) {
      console.error('Customer Balances Request Error:', error);
    }
  }
}
