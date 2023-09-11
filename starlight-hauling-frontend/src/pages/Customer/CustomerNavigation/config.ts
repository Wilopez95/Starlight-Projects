import { useTranslation } from 'react-i18next';
import { range } from 'lodash-es';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { OrderStatusRoutes, Paths } from '@root/consts';
import { isCore } from '@root/consts/env';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useIsRecyclingFacilityBU } from '@root/hooks';
import { ICustomer } from '@root/types';

const I18N_PATH = 'components.PageLayouts.CustomerLayout.CustomerNavigation.Text.';

const loadingConfigs: RoutingNavigationItem[] = range(7).map(x => ({
  loading: true,
  content: x,
}));

export const useNavigation = (customer: ICustomer | null): RoutingNavigationItem[] => {
  const { t } = useTranslation();
  const { businessUnitId } = useBusinessContext();
  const isRecycling = useIsRecyclingFacilityBU();

  if (!customer) {
    return loadingConfigs;
  }

  let orderAndSubscriptionTab = {
    content: t(`${I18N_PATH}OrdersAndSubscriptions`),
    to: pathToUrl(Paths.CustomerModule.OrdersAndSubscriptions, {
      businessUnit: businessUnitId,
      customerId: customer.id,
      subPath: undefined,
    }),
  };

  if (isCore && !isRecycling) {
    orderAndSubscriptionTab = {
      content: t(`${I18N_PATH}Orders`),
      to: pathToUrl(Paths.CustomerModule.OrdersAndSubscriptions, {
        businessUnit: businessUnitId,
        customerId: customer.id,
        subPath: undefined,
      }),
    };
  } else if (isRecycling) {
    orderAndSubscriptionTab = {
      content: t(`${I18N_PATH}Orders`),
      to: pathToUrl(Paths.CustomerModule.Orders, {
        businessUnit: businessUnitId,
        customerId: customer.id,
        subPath: OrderStatusRoutes.All,
      }),
    };
  }

  if (customer.walkup) {
    return [
      {
        content: t(`${I18N_PATH}Profile`),
        to: pathToUrl(Paths.CustomerModule.Profile, {
          businessUnit: businessUnitId,
          customerId: customer.id,
        }),
      },
      orderAndSubscriptionTab,

      {
        content: t(`${I18N_PATH}Invoices`),
        to: pathToUrl(Paths.CustomerModule.Invoices, {
          businessUnit: businessUnitId,
          customerId: customer.id,
          id: undefined,
        }),
      },
      {
        content: t(`${I18N_PATH}PaymentsAndStatements`),
        to: pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
          businessUnit: businessUnitId,
          customerId: customer.id,
          subPath: undefined,
          id: undefined,
        }),
      },
    ];
  }

  const routes = [
    {
      content: t(`${I18N_PATH}Profile`),
      to: pathToUrl(Paths.CustomerModule.Profile, {
        businessUnit: businessUnitId,
        customerId: customer.id,
      }),
    },
    orderAndSubscriptionTab,
    {
      content: t(`${I18N_PATH}JobSites`),
      to: pathToUrl(Paths.CustomerModule.JobSites, {
        businessUnit: businessUnitId,
        customerId: customer.id,
        subPath: undefined,
        jobSiteId: undefined,
      }),
    },
    {
      content: t(`${I18N_PATH}Contacts`),
      to: pathToUrl(Paths.CustomerModule.Contacts, {
        businessUnit: businessUnitId,
        customerId: customer.id,
      }),
    },
    {
      content: t(`${I18N_PATH}CreditCards`),
      to: pathToUrl(Paths.CustomerModule.CreditCards, {
        businessUnit: businessUnitId,
        customerId: customer.id,
      }),
    },
    {
      content: t(`${I18N_PATH}Invoices`),
      to: pathToUrl(Paths.CustomerModule.Invoices, {
        businessUnit: businessUnitId,
        customerId: customer.id,
        id: undefined,
      }),
    },
    {
      content: t(`${I18N_PATH}PaymentsAndStatements`),
      to: pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
        businessUnit: businessUnitId,
        customerId: customer.id,
        subPath: undefined,
        id: undefined,
      }),
    },
    {
      content: t(`${I18N_PATH}PurchaseOrders`),
      to: pathToUrl(Paths.CustomerModule.PurchaseOrders, {
        businessUnit: businessUnitId,
        customerId: customer.id,
      }),
    },
  ];

  if (isRecycling) {
    routes.push({
      content: t(`${I18N_PATH}Trucks`),
      to: pathToUrl(Paths.CustomerModule.Trucks, {
        businessUnit: businessUnitId,
        customerId: customer.id,
      }),
    });
  }

  if (!isCore) {
    routes.push({
      content: t(`${I18N_PATH}Attachments`),
      to: pathToUrl(Paths.CustomerModule.Attachments, {
        businessUnit: businessUnitId,
        customerId: customer.id,
      }),
    });
  }

  return routes;
};
