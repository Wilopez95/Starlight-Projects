import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router';
import { range } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { TableTools } from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useStores } from '@root/hooks';

import { CustomerNavigation, CustomerStyles } from '../Customer';

import PaymentsHeader from './Payments/Header';
import PaymentsTable from './Payments/Payments';
import PayoutsHeader from './Payouts/Header';
import PayoutsTable from './Payouts/Payouts';
import StatementsHeader from './Statements/Header';
import StatementsTable from './Statements/Statements';
import PaymentsFilter from './PaymentsFilter';
import { CustomerPaymentsAndStatementsParams } from './types';

const loadingRoutesConfig: RoutingNavigationItem[] = range(3).map(x => ({
  loading: true,
  content: x,
}));

const I18N_PATH = 'pages.CustomerPaymentsAndStatements.Text.';

const PaymentsAndStatements: React.FC = () => {
  const { customerStore, userStore } = useStores();
  const { subPath, customerId } = useParams<CustomerPaymentsAndStatementsParams>();

  const navigationAnchor = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  useCleanup(userStore);

  const [paymentFilters, setPaymentFilters] = useState<AppliedFilterState>({});
  const [payoutFilters, setPayoutFilters] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();

  const selectedCustomer = customerStore.selectedEntity;

  const { businessUnitId } = useBusinessContext();

  const isOnPaymentsTab = subPath === Routes.Payments;
  const filterable = isOnPaymentsTab || subPath === Routes.Payouts;

  useEffect(() => {
    userStore.request();
  }, [userStore]);

  if (!subPath) {
    const redirectToPaymentTab = pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
      businessUnit: businessUnitId,
      subPath: Routes.Payments,
      customerId,
      id: undefined,
    });

    return <Redirect to={redirectToPaymentTab} />;
  }

  const routes: RoutingNavigationItem[] = selectedCustomer
    ? [
        {
          content: 'Payments',
          to: pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
            customerId: selectedCustomer.id,
            businessUnit: businessUnitId,
            subPath: Routes.Payments,
            id: undefined,
          }),
        },
        {
          content: 'Payouts',
          to: pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
            customerId: selectedCustomer.id,
            businessUnit: businessUnitId,
            subPath: Routes.Payouts,
            id: undefined,
          }),
        },
        {
          content: 'Statements',
          to: pathToUrl(Paths.CustomerModule.PaymentsAndStatements, {
            customerId: selectedCustomer.id,
            businessUnit: businessUnitId,
            subPath: Routes.Statements,
            id: undefined,
          }),
        },
      ]
    : loadingRoutesConfig;

  let component: React.ReactElement | undefined;

  switch (subPath) {
    case Routes.Payments:
      component = (
        <>
          <PaymentsHeader />
          <PaymentsTable filters={paymentFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              filterable={filterable}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              onSearch={setSearch}
            >
              <PaymentsFilter onApply={setPaymentFilters} />
            </TableTools.HeaderNavigation>
          </PaymentsTable>
        </>
      );
      break;
    case Routes.Payouts:
      component = (
        <>
          <PayoutsHeader />
          <PayoutsTable filters={payoutFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              filterable={filterable}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              onSearch={setSearch}
            >
              <PaymentsFilter onApply={setPayoutFilters} />
            </TableTools.HeaderNavigation>
          </PayoutsTable>
        </>
      );
      break;
    case Routes.Statements:
      component = (
        <>
          <StatementsHeader />
          <StatementsTable>
            <TableTools.HeaderNavigation
              routes={routes}
              filterable={filterable}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              onSearch={setSearch}
            />
          </StatementsTable>
        </>
      );
      break;
    default:
      return null;
  }

  return (
    <>
      <Helmet
        title={t('Titles.CustomerPaymentsAndStatements', {
          customerName: selectedCustomer?.name ?? '',
        })}
      />
      <CustomerNavigation ref={navigationAnchor} />
      <CustomerStyles.PageContainer>{component}</CustomerStyles.PageContainer>
    </>
  );
};

export default observer(PaymentsAndStatements);
