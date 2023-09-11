import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { isEqual } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { CustomerJobSiteLayout } from '@root/components/PageLayouts/CustomerJobSiteLayout';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useStores } from '@root/hooks';

import { CustomerNavigation } from '../Customer';
import CustomerJobSiteContacts from '../CustomerJobSiteContacts/CustomerJobSiteContacts';
import CustomerJobSiteCreditCards from '../CustomerJobSiteCreditCards/CustomerJobSiteCreditCards';
import CustomerJobSiteInvoice from '../CustomerJobSiteInvoice/CustomerJobSiteInvoice';
import CustomerJobSitesInvoicedOrders from '../CustomerJobSitesInvoicedOrders/CustomerJobSitesInvoicedOrders';
import CustomerJobSitesOpenOrders from '../CustomerJobSitesOpenOrders/CustomerJobSitesOpenOrders';
import CustomerPairRates from '../CustomerPairRates/CustomerPairRates';

const I18N_PATH = 'pages.CustomerJobSites.Text.';

const CustomerJobSites: React.FC = () => {
  const { jobSiteStore, customerStore, orderStore } = useStores();
  const [search, setSearch] = useState('');

  const history = useHistory();
  const { t } = useTranslation();

  const { businessUnitId } = useBusinessContext();
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();

  const selectedCustomer = customerStore.selectedEntity;
  const selectedJobSite = jobSiteStore.selectedEntity;

  const handleSelectProject = useCallback(
    (maybeId?: number) => {
      setSelectedProjectId(p => {
        if (!isEqual(p, maybeId)) {
          orderStore.cleanup();
        }

        return maybeId;
      });
    },
    [orderStore],
  );

  const handleSearch = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);

      if (!selectedCustomer || newSearch.length < 3) {
        return;
      }

      jobSiteStore.cleanup();
      jobSiteStore.unSelectEntity();

      const url = pathToUrl(Paths.CustomerModule.JobSites, {
        businessUnit: businessUnitId,
        customerId: selectedCustomer.id,
        jobSiteId: undefined,
        subPath: undefined,
      });

      history.push(url);

      if (newSearch) {
        jobSiteStore.requestLinkedSearch({
          customerId: selectedCustomer.id,
          address: newSearch,
        });
      } else {
        jobSiteStore.requestByCustomer({
          customerId: selectedCustomer.id,
        });
      }
    },
    [businessUnitId, history, jobSiteStore, selectedCustomer],
  );

  return (
    <>
      <Helmet
        title={t('Titles.CustomerJobSites', { customerName: selectedCustomer?.name ?? '' })}
      />
      <CustomerNavigation
        onSearch={handleSearch}
        searchPlaceholder={t(`${I18N_PATH}SearchLinkedJobSite`)}
      />
      <CustomerJobSiteLayout
        projectId={selectedProjectId}
        onProjectSelect={handleSelectProject}
        search={search}
      >
        <Switch>
          <Route path={Paths.CustomerJobSiteModule.OpenOrders}>
            <CustomerJobSitesOpenOrders search={search} projectId={selectedProjectId} />
          </Route>
          <Route path={Paths.CustomerJobSiteModule.InvoicedOrders}>
            <CustomerJobSitesInvoicedOrders projectId={selectedProjectId} />
          </Route>
          <Route path={Paths.CustomerJobSiteModule.Rates}>
            <CustomerPairRates projectId={selectedProjectId} />
          </Route>
          <Route path={Paths.CustomerJobSiteModule.Invoices}>
            <CustomerJobSiteInvoice projectId={selectedProjectId} />
          </Route>
          <Route path={Paths.CustomerJobSiteModule.CreditCards}>
            <CustomerJobSiteCreditCards projectId={selectedProjectId} />
          </Route>
          <Route path={Paths.CustomerJobSiteModule.Contacts}>
            <CustomerJobSiteContacts projectId={selectedProjectId} />
          </Route>
          {selectedJobSite && selectedCustomer ? (
            <Route path="*">
              <Redirect
                to={pathToUrl(Paths.CustomerJobSiteModule.OpenOrders, {
                  businessUnit: businessUnitId,
                  customerId: selectedCustomer.id,
                  jobSiteId: selectedJobSite.id,
                })}
              />
            </Route>
          ) : null}
        </Switch>
      </CustomerJobSiteLayout>
    </>
  );
};

export default observer(CustomerJobSites);
