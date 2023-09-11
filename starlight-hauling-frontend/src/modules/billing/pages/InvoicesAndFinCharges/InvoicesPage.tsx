import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { isCore } from '@root/consts/env';

import { RoutingNavigationItem } from '../../../../common/RoutingNavigation';
import { TablePageContainer, TableTools } from '../../../../common/TableTools';
import { AppliedFilterState } from '../../../../common/TableTools/TableFilter';
import { Paths, Routes } from '../../../../consts';
import { pathToUrl } from '../../../../helpers';
import { useBusinessContext, useCleanup, useStores } from '../../../../hooks';
import { IInvoicesPageHandle } from '../InvoicesAndFinCharges/Invoices/types';

import FinanceCharges from './FinanceCharges/FinanceCharges';
import FinanceChargesHeader from './FinanceCharges/Header/Header';
import InvoicesHeader from './Invoices/Header/Header';
import Invoices from './Invoices/Invoices';
import FinChargesFilters from './FinChargesFilters';
import InvoicesFilters from './InvoicesFilters';
import { InvoiceAndFinanceChargeParams } from './types';

const I18N_PATH = 'pages.Invoices.Text.';

const InvoicesPage: React.FC = () => {
  const { userStore, customerStore, businessLineStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { subPath } = useParams<InvoiceAndFinanceChargeParams>();
  const [invoiceFilters, setInvoiceFilters] = useState<AppliedFilterState>({});
  const [finChargeFilters, setFinChargeFilters] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();
  const invoiceRef = useRef<IInvoicesPageHandle>(null);

  useCleanup(userStore);
  useCleanup(customerStore);

  const { t } = useTranslation();

  useEffect(() => {
    userStore.request();
    businessLineStore.request();
  }, [userStore, businessLineStore]);

  useEffect(() => {
    if (subPath === Routes.Invoices) {
      setFinChargeFilters({});
    } else {
      setInvoiceFilters({});
    }
  }, [subPath]);

  const routes: RoutingNavigationItem[] = [
    {
      content: 'Invoices',
      to: pathToUrl(Paths.BillingModule.Invoices, {
        businessUnit: businessUnitId,
        subPath: Routes.Invoices,
        id: undefined,
      }),
    },
    {
      content: 'Finance Charges',
      to: pathToUrl(Paths.BillingModule.Invoices, {
        businessUnit: businessUnitId,
        subPath: Routes.FinanceCharges,
        id: undefined,
      }),
    },
  ];

  let component: React.ReactElement | undefined;

  switch (subPath) {
    case Routes.Invoices:
      component = (
        <>
          <InvoicesHeader
            onInvoicesGenerated={invoiceRef.current?.requestData ?? noop}
            isRunInvoicing={!isCore}
          />
          <Invoices ref={invoiceRef} filters={invoiceFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              onSearch={setSearch}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              filterable
            >
              <InvoicesFilters onApply={setInvoiceFilters} />
            </TableTools.HeaderNavigation>
          </Invoices>
        </>
      );
      break;
    case Routes.FinanceCharges:
      component = (
        <>
          <FinanceChargesHeader />
          <FinanceCharges filters={finChargeFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              onSearch={setSearch}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              filterable
            >
              <FinChargesFilters onApply={setFinChargeFilters} />
            </TableTools.HeaderNavigation>
          </FinanceCharges>
        </>
      );
      break;
    default: {
      component = (
        <Redirect
          to={pathToUrl(Paths.BillingModule.Invoices, {
            businessUnit: businessUnitId,
            subPath: Routes.Invoices,
            id: undefined,
          })}
        />
      );
    }
  }

  return (
    <>
      <Helmet title={t('Titles.Invoices')} />
      <TablePageContainer>{component}</TablePageContainer>
    </>
  );
};

export default observer(InvoicesPage);
