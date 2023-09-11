import React from 'react';
import { useTranslation } from 'react-i18next';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { RoutingNavigation } from '@root/common';
import { type RoutingNavigationItem } from '@root/common/RoutingNavigation/types';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@hooks';

const loadingConfigs: RoutingNavigationItem[] = range(6).map(x => ({
  loading: true,
  content: x,
}));

const CustomerJobSiteNavigation: React.ForwardRefRenderFunction<HTMLDivElement> = (_, ref) => {
  const { customerStore, jobSiteStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { t } = useTranslation();
  const customer = customerStore.selectedEntity;
  const jobSite = jobSiteStore.selectedEntity;

  const routes: RoutingNavigationItem[] =
    customer && jobSite
      ? [
          {
            content: t(
              'components.PageLayouts.CustomerJobSiteLayout.CustomerJobSiteNavigation.Text.OpenOrders',
            ),
            to: pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            }),
          },
          {
            content: t(
              'components.PageLayouts.CustomerJobSiteLayout.CustomerJobSiteNavigation.Text.InvoicedOrders',
            ),
            to: pathToUrl(Paths.CustomerJobSiteModule.InvoicedOrders, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            }),
          },
          {
            content: t(
              'components.PageLayouts.CustomerJobSiteLayout.CustomerJobSiteNavigation.Text.Contacts',
            ),
            to: pathToUrl(Paths.CustomerJobSiteModule.Contacts, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            }),
          },
          {
            content: t(
              'components.PageLayouts.CustomerJobSiteLayout.CustomerJobSiteNavigation.Text.CreditCards',
            ),
            to: pathToUrl(Paths.CustomerJobSiteModule.CreditCards, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            }),
          },
          {
            content: t(
              'components.PageLayouts.CustomerJobSiteLayout.CustomerJobSiteNavigation.Text.Invoices',
            ),
            to: pathToUrl(Paths.CustomerJobSiteModule.Invoices, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            }),
          },
          {
            content: t(
              'components.PageLayouts.CustomerJobSiteLayout.CustomerJobSiteNavigation.Text.PairRates',
            ),
            to: pathToUrl(Paths.CustomerJobSiteModule.Rates, {
              businessUnit: businessUnitId,
              customerId: customer.id,
              jobSiteId: jobSite.id,
              id: undefined,
            }),
          },
        ]
      : loadingConfigs;

  return <RoutingNavigation routes={routes} ref={ref} withEmpty />;
};

export default observer(CustomerJobSiteNavigation, {
  forwardRef: true,
});
