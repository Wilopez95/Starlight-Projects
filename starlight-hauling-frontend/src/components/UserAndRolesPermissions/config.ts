import { ResourceType } from '@root/types';

type PermissionsRow = [boolean, boolean, boolean];
type SubjectAndRow = [string, PermissionsRow];
export type PermissionSectionConfig = {
  availableLevels: [boolean, boolean, boolean];
  items: { [sectionOrItemKey: string]: PermissionSectionConfig | SubjectAndRow };
};
type PermissionsConfig = {
  [type in ResourceType]: {
    [topLevelKey: string]: PermissionSectionConfig;
  };
};

const defaultCrud: PermissionsRow = [true, true, true];
const singleLevel: PermissionsRow = [false, false, true];
const viewUpdateAction: PermissionsRow = [true, true, false];

export const permissionsConfig: PermissionsConfig = {
  [ResourceType.GLOBAL]: {
    Configuration: {
      availableLevels: [true, true, true],
      items: {
        UsersAndRoles: ['configuration:users', defaultCrud],
        BusinessUnits: ['configuration:business-units', defaultCrud],
        CompanySettings: ['configuration:company-settings', defaultCrud],
        CustomerGroups: ['configuration:customer-groups', defaultCrud],
        Brokers: ['configuration:brokers', defaultCrud],
        ThirdPartyHaulers: ['configuration:third-party-haulers', defaultCrud],
        DisposalSites: ['configuration:disposal-sites', defaultCrud],
        TaxDistricts: ['configuration:tax-districts', defaultCrud],
        BillableItems: ['configuration:billable-items', defaultCrud],
        Materials: ['configuration:materials', defaultCrud],
        MaterialProfiles: ['configuration:material-profiles', defaultCrud],
        Equipment: ['configuration:equipment', defaultCrud],
        DriversAndTrucks: ['configuration:drivers-trucks', defaultCrud],
        OperatingCosts: ['configuration:operating-costs', defaultCrud],
        ChangeReasons: ['configuration:change-reasons', defaultCrud],
        CompanyProfile: ['configuration:company-profile', viewUpdateAction],
        QuickBooks: ['configuration:quick-books', singleLevel],
      },
    },
    DriverApp: {
      availableLevels: [false, false, true],
      items: {
        DriverAppAccess: ['configuration:driver-app-access', singleLevel],
        ControlOfWOQueue: ['configuration:driver-app-wo-control', singleLevel],
        OutOfServicePickup: ['configuration:driver-app-can-pickup', singleLevel],
      },
    },
    Dispatch: {
      availableLevels: [false, false, true],
      items: {
        RollOfContainer: ['configuration:dispatcher', singleLevel],
      },
    },
  },
  [ResourceType.HAULING]: {
    Configuration: {
      availableLevels: [true, true, true],
      items: {
        PriceGroups: {
          availableLevels: [true, true, true],
          items: {
            PriceGroups: ['configuration/price-groups:price-groups', defaultCrud],
            BulkUpdate: ['configuration/price-groups:bulk-update', singleLevel],
            ViewHistory: ['configuration/price-groups:view-history', singleLevel],
          },
        },
        Permits: ['configuration:permits', defaultCrud],
        Promos: ['configuration:promos', defaultCrud],
        ServiceAreas: ['configuration:service-areas', defaultCrud],
        Inventory: ['configuration:inventory', defaultCrud],
      },
    },
    Customers: {
      availableLevels: [false, false, true],
      items: {
        View: ['customers:view', singleLevel],
        Edit: ['customers:edit', singleLevel],
        Create: ['customers:create', singleLevel],
        Hold: ['customers:hold', singleLevel],
        SetCreditLimit: ['customers:set-credit-limit', singleLevel],
        TaxExempts: ['customers:tax-exempts', singleLevel],
        Contacts: ['customers:contacts', singleLevel],
        Trucks: ['customers:trucks', singleLevel],
      },
    },
    Orders: {
      availableLevels: [false, false, true],
      items: {
        ViewAll: ['orders:view-all', singleLevel],
        ViewOwn: ['orders:view-own', singleLevel],
        OverrideCreditLimit: ['orders:override-credit-limit', singleLevel],
        UnlockOverrides: ['orders:unlock-overrides', singleLevel],
        Edit: ['orders:edit', singleLevel],
        Complete: ['orders:complete', singleLevel],
        Uncomplete: ['orders:uncomplete', singleLevel],
        Approve: ['orders:approve', singleLevel],
        Finalize: ['orders:finalize', singleLevel],
        Unapprove: ['orders:unapprove', singleLevel],
        Unfinalize: ['orders:unfinalize', singleLevel],
        Cancel: ['orders:cancel', singleLevel],
        NewOrder: ['orders:new-order', singleLevel],
        NewPrepaidOnHoldOrder: ['orders:new-prepaid-on-hold-order', singleLevel],
        NewOnAccountOnHoldOrder: ['orders:new-on-account-on-hold-order', singleLevel],
        RecurrentOrderHold: ['orders:hold-recurrent', singleLevel],
        RecurrentOrderEnd: ['orders:end-recurrent', singleLevel],
        ChangeOrderTaxRate: ['orders:change-tax-rate', singleLevel],
        SubscriptionOrders: {
          availableLevels: [false, false, true],
          items: {
            Scheduled: ['orders/subscription-orders:scheduled', singleLevel],
            InProgress: ['orders/subscription-orders:in-progress', singleLevel],
            Completed: ['orders/subscription-orders:completed', singleLevel],
            Approved: ['orders/subscription-orders:approved', singleLevel],
            Finalized: ['orders/subscription-orders:finalized', singleLevel],
            Invoiced: ['orders/subscription-orders:invoiced', singleLevel],
          },
        },
      },
    },
    Subscriptions: {
      availableLevels: [true, true, true],
      items: {
        All: ['subscriptions:all', defaultCrud],
        Own: ['subscriptions:own', defaultCrud],
        PlaceNew: ['subscriptions:place-new', singleLevel],
        CreateForOnHold: ['subscriptions:create-for-on-hold', singleLevel],
        PutOnHold: ['subscriptions:put-on-hold', singleLevel],
        Clone: ['subscriptions:clone', singleLevel],
        UnlockOverrides: ['subscriptions:unlock-overrides', singleLevel],
        OverrideCreditLimit: ['subscriptions:override-credit-limit', singleLevel],
        ChangeProratedAmount: ['subscriptions:change-prorated-amount', singleLevel],
      },
    },
    Billing: {
      availableLevels: [false, false, true],
      items: {
        Invoices: {
          availableLevels: [false, false, true],
          items: {
            Invoices: ['billing/invoices:invoices', singleLevel],
            Invoicing: {
              availableLevels: [false, false, true],
              items: {
                Invoicing: ['billing/invoices/invoicing:invoicing', singleLevel],
                Refund: ['billing/invoices/invoicing:refund', singleLevel],
                Payment: ['billing/invoices/invoicing:payment', singleLevel],
                PutOnAccount: ['billing/invoices/invoicing:put-on-account', singleLevel],
              },
            },
          },
        },
        Payments: {
          availableLevels: [false, false, true],
          items: {
            Payments: ['billing/payments:payments', [true, false, true]],
            Refund: ['billing/payments:refund', singleLevel],
            Payout: ['billing/payments:payout', singleLevel],
            Reverse: ['billing/payments:reverse', singleLevel],
            CreditMemo: ['billing/payments:credit-memo', singleLevel],
            WriteOff: ['billing:write-offs', singleLevel],
          },
        },
        BatchStatements: ['billing:batch-statements', singleLevel],
        FinanceCharges: ['billing:finance-charges', singleLevel],
        Settlements: ['billing:settlements', singleLevel],
        BankDeposits: {
          availableLevels: [false, false, true],
          items: {
            BankDeposits: ['billing:bank-deposits', singleLevel],
            Locking: ['billing:lock-bank-deposits', singleLevel],
          },
        },
        DeferredPayments: {
          availableLevels: [false, false, true],
          items: {
            DeferredPayments: ['billing:deferred-payments', singleLevel],
            Charge: ['billing:charge-deferred-payments', singleLevel],
          },
        },
      },
    },
    Reports: {
      availableLevels: [true, true, true],
      items: {
        Accounting: ['reports:accounting', viewUpdateAction],
        Operational: ['reports:operational', viewUpdateAction],
        Sales: ['reports:sales', viewUpdateAction],
        Profitability: ['reports:profitability', viewUpdateAction],
        Custom: ['reports:custom', singleLevel],
      },
    },
    RoutePlanner: {
      availableLevels: [false, false, true],
      items: {
        MasterRoutes: ['routePlanner:master-routes', singleLevel],
        DailyRoutes: ['routePlanner:daily-routes', singleLevel],
        Dashboard: ['routePlanner:dashboard', singleLevel],
        WorkOrderList: ['routePlanner:work-orders-list', singleLevel],
      },
    },
    Dispatch: {
      availableLevels: [false, false, true],
      items: {
        RollOffDispatcher: ['dispatcher:app', singleLevel],
      },
    },
  },
  [ResourceType.RECYCLING]: {
    Configuration: {
      availableLevels: [true, true, true],
      items: {
        CustomerGroup: ['recycling:CustomerGroup', defaultCrud],
        Company: ['recycling:Company', defaultCrud],
        Container: ['recycling:Container', defaultCrud],
        Material: ['recycling:Material', defaultCrud],
        BillableItem: ['recycling:BillableItem', defaultCrud],
        GlobalRackRates: ['recycling:GlobalRackRates', viewUpdateAction],
        TaxDistrict: ['recycling:TaxDistrict', defaultCrud],
        Origin: ['recycling:Origin', defaultCrud],
        OriginDistrict: ['recycling:OriginDistrict', defaultCrud],
        Destination: ['recycling:Destination', defaultCrud],
        Scale: ['recycling:Scale', defaultCrud],
        PriceGroups: {
          availableLevels: [true, true, true],
          items: {
            PriceGroup: ['recycling:PriceGroup', defaultCrud],
            BulkUpdate: ['configuration/price-groups:bulk-update', singleLevel],
            ViewHistory: ['configuration/price-groups:view-history', singleLevel],
          },
        },
        ServiceAreas: ['configuration:service-areas', defaultCrud],
      },
    },
    Customers: {
      availableLevels: [true, true, true],
      items: {
        Customer: ['recycling:Customer', defaultCrud],
        CustomerJobSite: ['recycling:CustomerJobSite', defaultCrud],
        Project: ['recycling:Project', defaultCrud],
        TaxExemption: ['recycling:TaxExemption', defaultCrud],
        Comment: ['recycling:Comment', defaultCrud],
        CustomerContact: ['recycling:CustomerContact', defaultCrud],
        CreditCard: ['recycling:CreditCard', defaultCrud],
        CustomerTruck: ['recycling:CustomerTruck', defaultCrud],
        Hold: ['customers:hold', singleLevel],
        SetCreditLimit: ['customers:set-credit-limit', singleLevel],
      },
    },
    Orders: {
      availableLevels: [true, true, true],
      items: {
        Order: ['recycling:Order', defaultCrud],
        PreComplete: ['recycling:Order:precomplete', singleLevel],
        Complete: ['recycling:Order:complete', singleLevel],
        Approve: ['recycling:Order:approve', singleLevel],
        Finalize: ['recycling:Order:finalize', singleLevel],
        Invoice: ['recycling:Order:invoice', singleLevel],
        OverrideCreditLimit: ['orders:override-credit-limit', singleLevel],
        UnlockOverrides: ['orders:unlock-overrides', singleLevel],
        Edit: ['orders:edit', singleLevel],
        Unapprove: ['orders:unapprove', singleLevel],
        Unfinalize: ['orders:unfinalize', singleLevel],
        NewOnAccountOnHoldOrder: ['orders:new-on-account-on-hold-order', singleLevel],
        ChangeOrderTaxRate: ['orders:change-tax-rate', singleLevel],
        NonServiceOrder: ['recycling:NonServiceOrder', defaultCrud],
      },
    },
    Billing: {
      availableLevels: [false, false, true],
      items: {
        Invoices: {
          availableLevels: [false, false, true],
          items: {
            Invoices: ['billing/invoices:invoices', singleLevel],
            Invoicing: {
              availableLevels: [false, false, true],
              items: {
                Invoicing: ['billing/invoices/invoicing:invoicing', singleLevel],
                Refund: ['billing/invoices/invoicing:refund', singleLevel],
                Payment: ['billing/invoices/invoicing:payment', singleLevel],
                PutOnAccount: ['billing/invoices/invoicing:put-on-account', singleLevel],
              },
            },
          },
        },
        Payments: {
          availableLevels: [false, false, true],
          items: {
            Payments: ['billing/payments:payments', [true, false, true]],
            Refund: ['billing/payments:refund', singleLevel],
            Payout: ['billing/payments:payout', singleLevel],
            Reverse: ['billing/payments:reverse', singleLevel],
            CreditMemo: ['billing/payments:credit-memo', singleLevel],
            WriteOff: ['billing:write-offs', singleLevel],
          },
        },
        BatchStatements: ['billing:batch-statements', singleLevel],
        FinanceCharges: ['billing:finance-charges', singleLevel],
        Settlements: ['billing:settlements', singleLevel],
        BankDeposits: {
          availableLevels: [false, false, true],
          items: {
            BankDeposits: ['billing:bank-deposits', singleLevel],
            Locking: ['billing:lock-bank-deposits', singleLevel],
          },
        },
      },
    },
    YardOperations: {
      availableLevels: [false, false, true],
      items: {
        YardConsoleAccess: ['recycling:YardConsole', singleLevel],
        GradingInterface: ['recycling:GradingInterface', singleLevel],
        SelfService: ['recycling:SelfService', singleLevel],
        OverrideScalesWeight: ['recycling:OverrideScalesWeight', singleLevel],
      },
    },
    JobSites: {
      availableLevels: [true, true, true],
      items: {
        JobSite: ['recycling:JobSite', defaultCrud],
        JobSiteTaxDistrict: ['recycling:JobSiteTaxDistrict', defaultCrud],
      },
    },
    Reports: {
      availableLevels: [true, true, true],
      items: {
        Accounting: ['reports:accounting', viewUpdateAction],
        Operational: ['reports:operational', viewUpdateAction],
        Sales: ['reports:sales', viewUpdateAction],
        Custom: ['reports:custom', singleLevel],
      },
    },
  },
};
