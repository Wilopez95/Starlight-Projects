// follow alphabetical order
export type Permission =
  | 'billing/invoices:invoices:perform'
  | 'billing/invoices/invoicing:invoicing:perform'
  | 'billing/invoices/invoicing:refund:perform'
  | 'billing/invoices/invoicing:payment:perform'
  | 'billing/invoices/invoicing:put-on-account:perform'
  | 'billing/payments:payments:view'
  | 'billing/payments:payments:full-access'
  | 'billing/payments:refund:perform'
  | 'billing/payments:payout:perform'
  | 'billing/payments:reverse:perform'
  | 'billing/payments:credit-memo:perform'
  | 'billing:batch-statements:full-access'
  | 'billing:finance-charges:full-access'
  | 'billing:settlements:full-access'
  | 'billing:bank-deposits:full-access'
  | 'billing:lock-bank-deposits:perform'
  | 'billing:deferred-payments:full-access'
  | 'billing:charge-deferred-payments:perform'
  | 'billing:write-offs:full-access'
  | 'configuration:users:view'
  | 'configuration:users:list'
  | 'configuration:users:update'
  | 'configuration:users:create'
  | 'configuration:users:delete'
  | 'configuration:business-units:view'
  | 'configuration:business-units:list'
  | 'configuration:business-units:update'
  | 'configuration:business-units:create'
  | 'configuration:business-units:delete'
  | 'configuration:company-settings:view'
  | 'configuration:company-settings:list'
  | 'configuration:company-settings:update'
  | 'configuration:company-settings:create'
  | 'configuration:company-settings:delete'
  | 'configuration:customer-groups:view'
  | 'configuration:customer-groups:list'
  | 'configuration:customer-groups:update'
  | 'configuration:customer-groups:create'
  | 'configuration:customer-groups:delete'
  | 'configuration:drivers-trucks:view'
  | 'configuration:drivers-trucks:list'
  | 'configuration:drivers-trucks:update'
  | 'configuration:drivers-trucks:create'
  | 'configuration:brokers:view'
  | 'configuration:brokers:list'
  | 'configuration:brokers:update'
  | 'configuration:brokers:create'
  | 'configuration:brokers:delete'
  | 'configuration:change-reasons:view'
  | 'configuration:change-reasons:list'
  | 'configuration:change-reasons:update'
  | 'configuration:change-reasons:create'
  | 'configuration:change-reasons:delete'
  | 'configuration:third-party-haulers:view'
  | 'configuration:third-party-haulers:list'
  | 'configuration:third-party-haulers:update'
  | 'configuration:third-party-haulers:create'
  | 'configuration:third-party-haulers:delete'
  | 'configuration:disposal-sites:view'
  | 'configuration:disposal-sites:list'
  | 'configuration:disposal-sites:update'
  | 'configuration:disposal-sites:create'
  | 'configuration:disposal-sites:delete'
  | 'configuration:operating-costs:view'
  | 'configuration:operating-costs:list'
  | 'configuration:operating-costs:update'
  | 'configuration:operating-costs:create'
  | 'configuration:tax-districts:view'
  | 'configuration:tax-districts:list'
  | 'configuration:tax-districts:update'
  | 'configuration:tax-districts:create'
  | 'configuration:tax-districts:delete'
  | 'configuration:billable-items:view'
  | 'configuration:billable-items:list'
  | 'configuration:billable-items:update'
  | 'configuration:billable-items:create'
  | 'configuration:billable-items:delete'
  | 'configuration:materials:view'
  | 'configuration:materials:list'
  | 'configuration:materials:update'
  | 'configuration:materials:create'
  | 'configuration:materials:delete'
  | 'configuration:material-profiles:view'
  | 'configuration:material-profiles:list'
  | 'configuration:material-profiles:update'
  | 'configuration:material-profiles:create'
  | 'configuration:material-profiles:delete'
  | 'configuration:equipment:view'
  | 'configuration:equipment:list'
  | 'configuration:equipment:update'
  | 'configuration:equipment:create'
  | 'configuration:equipment:delete'
  | 'configuration:company-profile:view'
  | 'configuration:company-profile:update'
  | 'configuration/price-groups:price-groups:view'
  | 'configuration/price-groups:price-groups:list'
  | 'configuration/price-groups:price-groups:update'
  | 'configuration/price-groups:price-groups:create'
  | 'configuration/price-groups:price-groups:delete'
  | 'configuration:permits:view'
  | 'configuration:permits:list'
  | 'configuration:permits:update'
  | 'configuration:permits:create'
  | 'configuration:permits:delete'
  | 'configuration:promos:view'
  | 'configuration:promos:list'
  | 'configuration:promos:update'
  | 'configuration:promos:create'
  | 'configuration:promos:delete'
  | 'configuration:service-areas:view'
  | 'configuration:service-areas:list'
  | 'configuration:service-areas:update'
  | 'configuration:service-areas:create'
  | 'configuration:service-areas:delete'
  | 'configuration/price-groups:bulk-update:perform'
  | 'configuration/price-groups:view-history:perform'
  | 'customers:view:perform'
  | 'customers:edit:perform'
  | 'customers:create:perform'
  | 'customers:set-credit-limit:perform'
  | 'customers:hold:perform'
  | 'customers:tax-exempts:perform'
  | 'customers:contacts:perform'
  | 'orders:view-all:perform'
  | 'orders:view-own:perform'
  | 'orders:override-credit-limit:perform'
  | 'orders:unlock-overrides:perform'
  | 'orders:edit:perform'
  | 'orders:complete:perform'
  | 'orders:uncomplete:perform'
  | 'orders:approve:perform'
  | 'orders:finalize:perform'
  | 'orders:unfinalize:perform'
  | 'orders:unapprove:perform'
  | 'orders:cancel:perform'
  | 'orders:new-order:perform'
  | 'orders:new-prepaid-on-hold-order:perform'
  | 'orders:new-on-account-on-hold-order:perform'
  | 'orders:hold-recurrent:perform'
  | 'orders:end-recurrent:perform'
  | 'orders:change-tax-rate:perform'
  | 'orders/subscription-orders:scheduled:perform'
  | 'orders/subscription-orders:in-progress:perform'
  | 'orders/subscription-orders:completed:perform'
  | 'orders/subscription-orders:approved:perform'
  | 'orders/subscription-orders:finalized:perform'
  | 'orders/subscription-orders:invoiced:perform'
  | 'recycling:YardConsole:perform'
  | 'reports:accounting:view'
  | 'reports:accounting:update'
  | 'reports:operational:view'
  | 'reports:operational:update'
  | 'reports:sales:view'
  | 'reports:sales:update'
  | 'reports:profitability:view'
  | 'reports:profitability:update'
  | 'reports:custom:perform'
  | 'subscriptions:all:view'
  | 'subscriptions:all:full-access'
  | 'subscriptions:own:full-access'
  | 'subscriptions:all:list'
  | 'subscriptions:all:update'
  | 'subscriptions:all:create'
  | 'subscriptions:all:delete'
  | 'subscriptions:own:view'
  | 'subscriptions:own:list'
  | 'subscriptions:own:update'
  | 'subscriptions:own:create'
  | 'subscriptions:own:delete'
  | 'subscriptions:place-new:perform'
  | 'subscriptions:create-for-on-hold:perform'
  | 'subscriptions:put-on-hold:perform'
  | 'subscriptions:clone:perform'
  | 'subscriptions:unlock-overrides:perform'
  | 'subscriptions:change-prorated-amount:perform'
  | 'subscriptions:override-credit-limit:perform';
