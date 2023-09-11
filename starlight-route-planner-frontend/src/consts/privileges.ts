import { Privilege, PrivilegeType } from '@root/types';

export const privilegeLabels: Record<Privilege, string> = {
  billableItems: 'Billable Items',
  customerGroups: 'Customer Groups',
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

export const defaultPrivilegeData = Object.entries(privilegeLabels).reduce<
  Record<Privilege, PrivilegeType>
>((cur, [key]) => {
  cur[key as Privilege] = 'noAccess';

  return cur;
  // @ts-expect-error temporary
}, {});
