import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import { RoutingNavigationItem } from '@root/common/RoutingNavigation/types';
import {
  Table,
  TableBody,
  TableCell,
  TableCheckboxCell,
  TableInfiniteScroll,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { AppliedFilterState } from '@root/common/TableTools/TableFilter';
import { Paths } from '@root/consts';
import { hasDataAttribute, NotificationHelper, pathToUrl } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import {
  useBusinessContext,
  useCleanup,
  useCrudPermissions,
  useIsRecyclingFacilityBU,
  usePermission,
  useStores,
} from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { CustomerQuickView } from '@root/quickViews';
import { CustomerGroupType } from '@root/types';

import CustomerFilters from './components/CustomerFilters/CustomerFilters';
import CustomersHeader from './components/Header/Header';
import { getBadgeByStatus } from './helpers/getBadgeByStatus';
import { customerGroupNavigationConfig } from './customerGroupNavigationConfig';
import { ICustomerParams } from './types';

import styles from './css/styles.scss';

const I18N_PATH = 'pages.Customers.CustomersPage.';

const CustomerPage: React.FC = () => {
  const { brokerStore, customerStore, customerGroupStore, jobSiteStore } = useStores();
  const { customerGroupId } = useParams<ICustomerParams>();
  const { businessUnitId } = useBusinessContext();

  const [filterState, setFilterState] = useState<AppliedFilterState>({});
  const [search, setSearch] = useState<string>();

  const [canViewBrokers] = useCrudPermissions('configuration', 'brokers');
  const canViewCustomers = usePermission('customers:view:perform');

  const isRecyclingFacilityBU = useIsRecyclingFacilityBU();

  const tableNavigationRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const { formatCurrency } = useIntl();

  useCleanup(customerStore, 'id', 'asc');
  useCleanup(brokerStore);
  useCleanup(jobSiteStore);

  const selectedCustomerGroup = customerGroupStore.getById(customerGroupId);

  const loadMore = useCallback(() => {
    if (!canViewCustomers) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      customerStore.markLoaded();

      return;
    }

    customerStore.request({
      customerGroupId,
      businessUnitId,
      filterData: filterState,
      query: search,
    });
  }, [canViewCustomers, customerStore, customerGroupId, businessUnitId, filterState, search]);

  useEffect(() => {
    if (canViewBrokers) {
      brokerStore.request();
    }
  }, [canViewBrokers, brokerStore]);

  useEffect(() => {
    if (!canViewCustomers) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
      customerStore.markLoaded();

      return;
    }

    customerStore.requestCount({ businessUnitId, filterData: filterState, query: search });
    customerStore.request({
      customerGroupId,
      businessUnitId,
      filterData: filterState,
      query: search,
    });

    return () => {
      customerStore.cleanup();
    };
  }, [canViewCustomers, businessUnitId, search, customerGroupId, customerStore, filterState]);

  const handleCheckAll = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      customerStore.checkAll(e.target.checked);
    },
    [customerStore],
  );

  const { isAllChecked } = customerStore;
  const { checkedCustomers } = customerStore;
  const indeterminate = !isAllChecked && checkedCustomers.length > 0;

  const customerContainerRef = useRef<HTMLTableSectionElement>(null);

  const navigationTabs: RoutingNavigationItem[] = useMemo(() => {
    if (customerStore.counts !== undefined) {
      const navItems = [
        {
          content: 'All Customers',
          to: pathToUrl(Paths.CustomersModule.Customers, {
            businessUnit: businessUnitId,
            customerGroupId: 'all',
          }),
        },
      ];

      if (!isRecyclingFacilityBU) {
        navItems.push(
          ...customerGroupStore.values
            .filter(customerGroup => customerGroup.active)
            .filter(customerGroup => customerGroup.type !== CustomerGroupType.walkUp)
            .map(group => ({
              content: group.description,
              to: pathToUrl(Paths.CustomersModule.Customers, {
                businessUnit: businessUnitId,
                customerGroupId: group.id,
              }),
            })),
        );
      }

      return navItems;
    }

    return customerGroupNavigationConfig;
  }, [businessUnitId, customerGroupStore.values, customerStore.counts, isRecyclingFacilityBU]);

  const pageTitle = useMemo(
    () =>
      customerGroupId === 'all' ? t('Text.Customer') : selectedCustomerGroup?.description ?? '',
    [t, customerGroupId, selectedCustomerGroup],
  );

  return (
    <>
      <Helmet title={t('Titles.AllCustomers', { customerName: pageTitle })} />
      <CustomerQuickView
        clickOutContainers={customerContainerRef}
        isOpen={customerStore.isOpenQuickView}
      />
      <TablePageContainer>
        <CustomersHeader customerGroupId={customerGroupId} businessUnitId={businessUnitId} />
        <TableTools.ScrollContainer>
          <TableTools.HeaderNavigation
            placeholder={t('Text.SearchCustomers')}
            onSearch={setSearch}
            routes={navigationTabs}
            navigationRef={tableNavigationRef}
            filterable
          >
            <CustomerFilters onApply={setFilterState} />
          </TableTools.HeaderNavigation>
          <Table>
            <TableTools.Header>
              <TableCheckboxCell
                header
                name="AllCustomers"
                onChange={handleCheckAll}
                value={isAllChecked}
                indeterminate={indeterminate}
              />
              <TableTools.SortableHeaderCell store={customerStore} sortKey="name" onSort={loadMore}>
                {t(`${I18N_PATH}Name`)}
              </TableTools.SortableHeaderCell>

              <TableTools.SortableHeaderCell
                store={customerStore}
                sortKey="status"
                onSort={loadMore}
              >
                {t(`${I18N_PATH}State`)}
              </TableTools.SortableHeaderCell>

              <TableTools.SortableHeaderCell store={customerStore} sortKey="id" onSort={loadMore}>
                Id
              </TableTools.SortableHeaderCell>

              {customerGroupId === 'all' ? (
                <TableTools.SortableHeaderCell
                  store={customerStore}
                  sortKey="group"
                  onSort={loadMore}
                >
                  {t(`${I18N_PATH}Group`)}
                </TableTools.SortableHeaderCell>
              ) : null}

              <TableTools.SortableHeaderCell
                store={customerStore}
                sortKey="contactPerson"
                onSort={loadMore}
              >
                {t(`${I18N_PATH}ContactPerson`)}
              </TableTools.SortableHeaderCell>

              <TableTools.HeaderCell>{t(`${I18N_PATH}PhoneNumber`)}</TableTools.HeaderCell>

              {!isRecyclingFacilityBU ? (
                <TableTools.SortableHeaderCell
                  store={customerStore}
                  onSort={loadMore}
                  sortKey="owner"
                >
                  {t(`${I18N_PATH}Broker`)}
                </TableTools.SortableHeaderCell>
              ) : null}

              <TableTools.SortableHeaderCell
                store={customerStore}
                sortKey="balance"
                onSort={loadMore}
                right
              >
                {t(`${I18N_PATH}Balance`)}
              </TableTools.SortableHeaderCell>
            </TableTools.Header>
            <TableBody
              className={styles.rows}
              ref={customerContainerRef}
              loading={customerStore.loading}
              cells={customerGroupId === 'all' ? 8 : 7}
              noResult={customerStore.noResult}
            >
              {customerStore.values.map(customer => (
                <TableRow
                  selected={customer.id === customerStore.selectedEntity?.id}
                  onClick={e => {
                    if (hasDataAttribute(e, 'skipEvent')) {
                      return;
                    }

                    customerStore.selectEntity(customer);
                  }}
                  key={customer.id}
                >
                  <TableCheckboxCell
                    name={`customer-${customer.id}`}
                    onChange={customer.check}
                    value={customer.checked}
                  />
                  <TableCell
                    to={pathToUrl(Paths.CustomerModule.Profile, {
                      businessUnit: businessUnitId,
                      customerId: customer.id,
                    })}
                  >
                    {customer.name}
                  </TableCell>
                  <TableCell fallback="">{getBadgeByStatus(customer.status)}</TableCell>
                  <TableCell>{customer.id}</TableCell>
                  {customerGroupId === 'all' ? (
                    <TableCell>{customer.customerGroup?.description}</TableCell>
                  ) : null}
                  <TableCell>{customer.contactPerson}</TableCell>
                  <TableCell>{customer.phone?.number}</TableCell>
                  {!isRecyclingFacilityBU ? <TableCell>{customer.owner?.name}</TableCell> : null}
                  <TableCell right>
                    <Typography fontWeight="bold">{formatCurrency(customer.balance)}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TableInfiniteScroll
            onLoaderReached={loadMore}
            loaded={customerStore.loaded}
            loading={customerStore.loading}
          >
            {t(`${I18N_PATH}LoadingCustomers`)}
          </TableInfiniteScroll>
        </TableTools.ScrollContainer>
      </TablePageContainer>
    </>
  );
};

export default observer(CustomerPage);
