import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, useParams } from 'react-router';
import { observer } from 'mobx-react-lite';

import { RoutingNavigationItem } from '@root/common/RoutingNavigation';
import { TableTools } from '@root/common/TableTools';
import {
  AppliedFilterState,
  DateRangeFilter,
  MultiSelectFilter,
  NumberRangeFilter,
  TableFilter,
  TableFilterConfig,
} from '@root/common/TableTools/TableFilter';
import { Paths, Routes } from '@root/consts';
import { pathToUrl } from '@root/helpers';
import { useIntl } from '@root/i18n/useIntl';
import {
  commonStatusOptions,
  invoiceAgeOptions,
  invoiceStatusOptions,
} from '@root/modules/billing/pages/InvoicesAndFinCharges/filtersOptions';
import { useBusinessContext, useCleanup, useStores } from '@hooks';

import { CustomerNavigation, CustomerStyles } from '../Customer';

import FinanceCharges from './FinanceCharges/FinanceCharges';
import FinanceChargesHeader from './FinanceCharges/Header/Header';
import InvoicesHeader from './Invoices/Header/Header';
import Invoices from './Invoices/Invoices';

const I18N_PATH = 'pages.Invoices.Text.';

const InvoicesPage: React.FC = () => {
  const { customerStore, userStore } = useStores();
  const { businessUnitId } = useBusinessContext();
  const { subPath } = useParams<{ subPath: string }>();
  const [invoiceFilters, setInvoiceFilters] = useState<AppliedFilterState>({});
  const [finChargeFilters, setFinChargeFilters] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();

  const currentCustomer = customerStore.selectedEntity;
  const isOnInvoicesTab = subPath === Routes.Invoices;

  useCleanup(userStore);

  const { t } = useTranslation();
  const { currencySymbol } = useIntl();

  useEffect(() => {
    userStore.request();
  }, [userStore]);

  const handleFilterApply = useCallback(
    (filterState: AppliedFilterState) => {
      if (isOnInvoicesTab) {
        setInvoiceFilters(filterState);
      } else {
        setFinChargeFilters(filterState);
      }
    },
    [isOnInvoicesTab],
  );

  const routes: RoutingNavigationItem[] = [
    {
      content: 'Invoices',
      to: pathToUrl(Paths.CustomerModule.Invoices, {
        businessUnit: businessUnitId,
        customerId: currentCustomer?.id,
        subPath: Routes.Invoices,
        id: undefined,
      }),
    },
    {
      content: 'Finance Charges',
      to: pathToUrl(Paths.CustomerModule.Invoices, {
        businessUnit: businessUnitId,
        customerId: currentCustomer?.id,
        subPath: Routes.FinanceCharges,
        id: undefined,
      }),
    },
  ];

  const filterComponent = (
    <TableFilter onApply={handleFilterApply}>
      <TableFilterConfig label={t(`${I18N_PATH}Status`)} filterByKey="filterByStatus">
        <MultiSelectFilter
          options={
            isOnInvoicesTab
              ? [...commonStatusOptions, ...invoiceStatusOptions]
              : commonStatusOptions
          }
        />
      </TableFilterConfig>
      {isOnInvoicesTab ? (
        <TableFilterConfig label={t(`${I18N_PATH}InvoiceAge`)} filterByKey="filterByAge">
          <MultiSelectFilter options={invoiceAgeOptions} />
        </TableFilterConfig>
      ) : null}
      <TableFilterConfig label={t(`${I18N_PATH}CreationDate`)} filterByKey="filterByCreationDate">
        <DateRangeFilter
          fromDatePropName="filterByCreatedFrom"
          toDatePropName="filterByCreatedTo"
          isCreateDate
        />
      </TableFilterConfig>
      {isOnInvoicesTab ? (
        <TableFilterConfig label={t(`${I18N_PATH}DueDate`)} filterByKey="filterByDueDate">
          <DateRangeFilter
            fromDatePropName="filterByDueDateFrom"
            toDatePropName="filterByDueDateTo"
          />
        </TableFilterConfig>
      ) : null}
      <TableFilterConfig label={t(`${I18N_PATH}Amount`)} filterByKey="filterByAmount">
        <NumberRangeFilter
          fromNumberPropName="filterByAmountFrom"
          toNumberPropName="filterByAmountTo"
          unit={currencySymbol}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}Balance`)} filterByKey="filterByBalance">
        <NumberRangeFilter
          fromNumberPropName="filterByBalanceFrom"
          toNumberPropName="filterByBalanceTo"
          unit={currencySymbol}
        />
      </TableFilterConfig>
      <TableFilterConfig label={t(`${I18N_PATH}User`)} filterByKey="filterByUser">
        <MultiSelectFilter
          searchable
          options={userStore.values.map(user => ({
            label: user.name,
            value: user.id,
          }))}
        />
      </TableFilterConfig>
    </TableFilter>
  );

  let component: React.ReactElement | undefined;

  switch (subPath) {
    case Routes.Invoices:
      component = (
        <>
          <InvoicesHeader />
          <Invoices filters={invoiceFilters} query={search}>
            <TableTools.HeaderNavigation
              routes={routes}
              onSearch={setSearch}
              placeholder={t(`${I18N_PATH}SearchPlaceholder`)}
              filterable
            >
              {filterComponent}
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
              {filterComponent}
            </TableTools.HeaderNavigation>
          </FinanceCharges>
        </>
      );
      break;
    default: {
      component = (
        <Redirect
          to={pathToUrl(Paths.CustomerModule.Invoices, {
            businessUnit: businessUnitId,
            customerId: currentCustomer?.id,
            subPath: Routes.Invoices,
            id: undefined,
          })}
        />
      );
    }
  }

  return (
    <>
      <CustomerNavigation />
      <CustomerStyles.PageContainer>{component}</CustomerStyles.PageContainer>
    </>
  );
};

export default observer(InvoicesPage);
