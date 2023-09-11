export const USER_PRIVILEGE_ACCESS = {
  noAccess: 'noAccess',
  read: 'read',
  modify: 'modify',
  fullAccess: 'fullAccess',
};

export const USER_PRIVILEGE_ACCESSES = Object.values(USER_PRIVILEGE_ACCESS);

export const USER_PRIVILEGE = {
  billableItems: 'billableItems',
  customerGroups: 'customerGroups',
  equipmentItems: 'equipmentItems',
  receivePayments: 'receivePayments',
  promos: 'promos',
  offices: 'offices',
  userAndGroups: 'userAndGroups',
  orders: 'orders',
  invoices: 'invoices',
  bankDeposits: 'bankDeposits',
  financialHistory: 'financialHistory',
  customers: 'customers',
  thirdPartyHaulers: 'thirdPartyHaulers',
  permits: 'permits',
  issueAccountCredit: 'issueAccountCredit',
  issuePayouts: 'issuePayouts',
  statements: 'statements',
  unappliedPayments: 'unappliedPayments',
  materials: 'materials',
  priceGroups: 'priceGroups',
  contacts: 'contacts',
  brokers: 'brokers',
  creditCards: 'creditCards',
  disposalSites: 'disposalSites',
  materialProfiles: 'materialProfiles',

  editAccessPrivileges: 'editAccessPrivileges',
  lockBankDeposits: 'lockBankDeposits',
  updateQuickBooks: 'updateQuickBooks',
  setCreditLimits: 'setCreditLimits',
  overrideCreditLimits: 'overrideCreditLimits',
  overridePricing: 'overridePricing',
  quickBooksSetup: 'quickBooksSetup',
  quickBooksBalances: 'quickBooksBalances',

  dataLists: 'dataLists',
  production: 'production',
  arReports: 'arReports',
};

export const USER_PRIVILEGES = Object.values(USER_PRIVILEGE);
