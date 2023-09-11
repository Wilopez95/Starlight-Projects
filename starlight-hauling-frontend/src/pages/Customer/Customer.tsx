import React, { useEffect, useRef } from 'react';
import { Redirect, Route, Switch, useHistory, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { TablePageContainer } from '@root/common/TableTools';
import { Paths } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useIsRecyclingFacilityBU, useStores } from '@root/hooks';
import CustomerCreditCardsPage from '@root/modules/billing/CreditCards/pages/CustomerCreditCards/CustomerCreditCards';

import CustomerAttachmentsPage from '../CustomerAttachments/CustomerAttachments';
import CustomerContactsPage from '../CustomerContacts/CustomerContacts';
import CustomerInvoicesPage from '../CustomerInvoices/CustomerInvoices';
import CustomerJobSitesPage from '../CustomerJobSites/CustomerJobSites';
import { CustomerOrdersAndSubscriptionsPage } from '../CustomerOrdersAndSubscriptions/CustomerOrdersAndSubscriptions';
import CustomerPaymentsAndStatementsPage from '../CustomerPaymentsAndStatements/CustomerPaymentsAndStatements';
import CustomerProfilePage from '../CustomerProfile/Profile';
import { CustomerRecyclingOrderTable } from '../CustomerRecyclingOrderTable/CustomerRecyclingOrderTable';
import CustomerTrucksPage from '../CustomerTrucks/CustomerTrucks';
import PurchaseOrdersPage from '../PurchaseOrders/PurchaseOrders';

import CustomerInformation from './CustomerInformation/CustomerInformation';
import { ICustomerPageParams } from './types';

const CustomerPage: React.FC = () => {
  const { customerStore } = useStores();
  const history = useHistory();

  const { customerId } = useParams<ICustomerPageParams>();
  const { businessUnitId } = useBusinessContext();
  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();
  const selectedCustomer = customerStore.selectedEntity;
  const containerRef = useRef(null);

  useCleanup(customerStore);

  useEffect(() => {
    const fallbackToCustomersTableUrl = pathToUrl(Paths.CustomersModule.Customers, {
      businessUnit: businessUnitId,
      customerGroupId: 'all',
    });

    if (!customerId) {
      history.push(fallbackToCustomersTableUrl);
    }
    const query = async () => {
      const customer = await customerStore.requestById(+customerId);

      if (!customer) {
        history.push(fallbackToCustomersTableUrl);
      }
    };

    query();
  }, [businessUnitId, customerId, customerStore, history]);

  return (
    <TablePageContainer ref={containerRef}>
      <CustomerInformation />
      {selectedCustomer && selectedCustomer.id === +customerId ? (
        <Switch>
          <Route path={Paths.CustomerModule.Profile} exact>
            <CustomerProfilePage />
          </Route>

          {isRecyclingFacilityBU ? (
            <Route path={Paths.CustomerModule.Orders}>
              <CustomerRecyclingOrderTable sidePanelContainer={containerRef.current} />
            </Route>
          ) : (
            <Route path={Paths.CustomerModule.OrdersAndSubscriptions}>
              <CustomerOrdersAndSubscriptionsPage />
            </Route>
          )}

          {isRecyclingFacilityBU ? (
            <Route path={Paths.CustomerModule.Trucks} exact>
              <CustomerTrucksPage sidePanelContainer={containerRef.current} />
            </Route>
          ) : null}

          {!selectedCustomer.walkup
            ? [
                <Route path={Paths.CustomerModule.JobSites} key={Paths.CustomerModule.JobSites}>
                  <CustomerJobSitesPage />
                </Route>,
                <Route
                  path={Paths.CustomerModule.Contacts}
                  exact
                  key={Paths.CustomerModule.Contacts}
                >
                  <CustomerContactsPage />
                </Route>,
                <Route
                  path={Paths.CustomerModule.CreditCards}
                  exact
                  key={Paths.CustomerModule.CreditCards}
                >
                  <CustomerCreditCardsPage />
                </Route>,
                <Route
                  path={Paths.CustomerModule.Attachments}
                  exact
                  key={Paths.CustomerModule.Attachments}
                >
                  <CustomerAttachmentsPage />
                </Route>,
                <Route
                  path={Paths.CustomerModule.PurchaseOrders}
                  exact
                  key={Paths.CustomerModule.PurchaseOrders}
                >
                  <PurchaseOrdersPage />
                </Route>,
              ]
            : null}

          <Route path={Paths.CustomerModule.Invoices} exact>
            <CustomerInvoicesPage />
          </Route>

          <Route path={Paths.CustomerModule.PaymentsAndStatements} exact>
            <CustomerPaymentsAndStatementsPage />
          </Route>

          <Route path="*">
            <Redirect
              to={pathToUrl(Paths.CustomerModule.Profile, {
                businessUnit: businessUnitId,
                customerId,
              })}
            />
          </Route>
        </Switch>
      ) : null}
    </TablePageContainer>
  );
};

export default observer(CustomerPage);
