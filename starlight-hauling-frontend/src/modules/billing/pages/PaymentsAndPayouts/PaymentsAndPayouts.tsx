import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { TablePageContainer, TableTools } from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useBusinessContext, useCleanup, useCrudPermissions, useStores } from '@root/hooks';

import PaymentsHeader from './Payments/Header';
import Payments from './Payments/Payments';
import PayoutsHeader from './Payouts/Header';
import Payouts from './Payouts/Payouts';
import PaymentsFilter from './PaymentsFilter';
import PayoutsFilter from './PayoutsFilter';
import { PaymentAndPayoutsParams } from './types';

const I18N_PATH = 'pages.PaymentsAndPayouts.Text.';

const PaymentsAndPayouts: React.FC = () => {
  const { customerStore, userStore } = useStores();
  const navigationRef = useRef<HTMLDivElement>(null);
  const { businessUnitId } = useBusinessContext();
  const { subPath } = useParams<PaymentAndPayoutsParams>();
  const [paymentFilters, setPaymentFilters] = useState<AppliedFilterState>({});
  const [payoutFilters, setPayoutFilters] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();
  const { t } = useTranslation();

  const [canViewUsers] = useCrudPermissions('configuration', 'users');

  useCleanup(customerStore);

  useEffect(() => {
    if (canViewUsers) {
      userStore.request();
    }
  }, [canViewUsers, userStore]);

  useEffect(() => {
    if (subPath === Routes.Payments) {
      setPayoutFilters({});
    } else {
      setPaymentFilters({});
    }
  }, [subPath]);

  const routes: RoutingNavigationItem[] = [
    {
      content: 'Payments',
      to: pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
        businessUnit: businessUnitId,
        subPath: Routes.Payments,
        id: undefined,
      }),
    },
    {
      content: 'Payouts',
      to: pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
        businessUnit: businessUnitId,
        subPath: Routes.Payouts,
        id: undefined,
      }),
    },
  ];

  let component: React.ReactElement | undefined;

  switch (subPath) {
    case Routes.Payments:
      component = (
        <>
          <PaymentsHeader />
          <Payments filters={paymentFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              onSearch={setSearch}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              navigationRef={navigationRef}
              filterable
            >
              <PaymentsFilter onApply={setPaymentFilters} />
            </TableTools.HeaderNavigation>
          </Payments>
        </>
      );
      break;
    case Routes.Payouts:
      component = (
        <>
          <PayoutsHeader />
          <Payouts filters={payoutFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              onSearch={setSearch}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              navigationRef={navigationRef}
              filterable
            >
              <PayoutsFilter onApply={setPayoutFilters} />
            </TableTools.HeaderNavigation>
          </Payouts>
        </>
      );
      break;
    default: {
      component = (
        <Redirect
          to={pathToUrl(Paths.BillingModule.PaymentsAndPayouts, {
            businessUnit: businessUnitId,
            subPath: Routes.Payments,
            id: undefined,
          })}
        />
      );
    }
  }

  return (
    <>
      <Helmet title={t('Titles.PaymentsAndPayouts')} />
      <TablePageContainer>{component}</TablePageContainer>
    </>
  );
};

export default observer(PaymentsAndPayouts);
