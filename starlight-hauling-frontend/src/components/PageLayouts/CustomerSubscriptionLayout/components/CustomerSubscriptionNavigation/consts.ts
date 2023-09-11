import { Paths } from '@root/consts';

const I18N_PATH =
  'components.PageLayouts.CustomerSubscriptionLayout.components.CustomerSubscriptionNavigation.Text.';

export const SubscriptionNavigationRoutes = [
  {
    content: `${I18N_PATH}MainInformation`,
    to: Paths.CustomerSubscriptionModule.Details,
  },
  {
    content: `${I18N_PATH}History`,
    to: Paths.CustomerSubscriptionModule.History,
  },
  {
    content: `${I18N_PATH}AttachedMedia`,
    to: Paths.CustomerSubscriptionModule.Media,
  },
  {
    content: `${I18N_PATH}SubscriptionOrders`,
    to: Paths.CustomerSubscriptionModule.Orders,
  },
  {
    content: `${I18N_PATH}JobSites`,
    to: Paths.CustomerSubscriptionModule.JobSites,
    disabled: true,
  },
  {
    content: `${I18N_PATH}Invoices`,
    to: Paths.CustomerSubscriptionModule.Invoices,
  },
];

export const SubscriptionDraftNavigationRoutes = [
  {
    content: `${I18N_PATH}MainInformation`,
    to: Paths.CustomerSubscriptionModule.Details,
  },
  {
    content: `${I18N_PATH}History`,
    to: Paths.CustomerSubscriptionModule.History,
  },
  {
    content: `${I18N_PATH}AttachedMedia`,
    to: Paths.CustomerSubscriptionModule.Media,
  },
];
