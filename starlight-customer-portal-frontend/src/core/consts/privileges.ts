import { Privilege, PrivilegeType } from '@root/core/types';

//!TODO improve this
export const privilegeLabels: Record<Privilege, string> = {
  billableItems: 'Billable Items',
  customerGroups: 'Profile Groups',
  equipmentItems: 'Equipment',
  receivePayments: 'Receive Payments',
  promos: 'Promos',
  offices: 'Offices',
  userAndGroups: 'User And Groups',
  orders: 'Orders',
  invoices: 'Invoices',
  bankDeposits: 'Bank Deposits',
  financialHistory: 'Financial History',
  customers: 'Customers',
  thirdPartyHaulers: 'Third Party Haulers',
  permits: 'Permits',
  issueAccountCredit: 'Issue Account Credit',
  issuePayouts: 'Issue Payouts',
  statements: 'Statements',
  unappliedPayments: 'Unapplied Payments',
  materials: 'Materials',
  priceGroups: 'Price Groups',
  contacts: 'Contacts',
  brokers: 'Brokers',
  creditCards: 'Credit Cards',
  disposalSites: 'Disposal Sites',
  materialProfiles: 'Material Profiles',
  editAccessPrivileges: 'Edit Access Privileges',
  lockBankDeposits: 'Lock Bank Deposits',
  updateQuickBooks: 'Update Quick Books',
  setCreditLimits: 'Set Credit Limits',
  overrideCreditLimits: 'Override Credit Limits',
  overridePricing: 'Override Pricing',
  quickBooksSetup: 'Quick Books Setup',
  quickBooksBalances: 'Quick Books Balances',
  dataLists: 'Data Lists',
  production: 'Production',
  arReports: 'Ar Reports',
};

export const privilegeTypes: PrivilegeType[] = ['noAccess', 'read', 'modify', 'fullAccess'];

export const defaultPrivilegeData = Object.entries(privilegeLabels).reduce((cur, [key]) => {
  cur[key as Privilege] = 'noAccess';

  return cur;
}, {} as Record<Privilege, PrivilegeType>);
