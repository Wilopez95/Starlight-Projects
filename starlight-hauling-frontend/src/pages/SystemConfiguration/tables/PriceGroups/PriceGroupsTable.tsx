import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import { NavigationConfigItem } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Table,
  TableBody,
  TableCell,
  TableInfiniteScroll,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { handleEnterOrSpaceKeyDown, NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { useBusinessContext, useCleanup, useCrudPermissions, useStores } from '@root/hooks';
import { useIntl } from '@root/i18n/useIntl';
import { PriceGroup } from '@root/stores/entities';

import { ISystemConfigurationTable } from '../../types';

import configurationStyle from '../../css/styles.scss';
import PageHeader from './PageHeader/PageHeader';
import BulkRatesEditQuickView from './QuickView/BulkRatesEdit/BulkRatesEditQuickView';
import PriceGroupQuickView from './QuickView/PriceGroup/PriceGroupQuickView';
import PriceGroupRatesQuickView from './QuickView/PriceGroupRates/PriceGroupRatesQuickView';
import { useNavigation } from './hooks';
import { PriceGroupsTab } from './types';

const I18N_PATH = 'pages.PriceGroups.Text.';

const PriceGroupsTable: React.FC<ISystemConfigurationTable> = () => {
  const { businessLineStore, priceGroupStore, customerGroupStore, systemConfigurationStore } =
    useStores();
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);
  const { state } = useLocation<{ id?: number; tab?: string }>();

  const tbodyContainerRef = useRef(null);
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  useCleanup(priceGroupStore);

  const { businessLineId, businessUnitId } = useBusinessContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const navigationConfig = useNavigation(isRecyclingLoB);
  const currConfig = useMemo(
    () =>
      state?.tab === PriceGroupsTab.customerJobSites ? navigationConfig[2] : navigationConfig[0],
    [navigationConfig, state?.tab],
  );

  const [currentTab, setCurrentTab] = useState(currConfig);

  const selectedPriceGroup = priceGroupStore.selectedEntity;
  const priceGroups = priceGroupStore.values;

  const [canViewPrices] = useCrudPermissions('configuration/price-groups', 'price-groups');
  const [canViewCustomerGroups] = useCrudPermissions('configuration', 'customer-groups');
  const [canViewBillableItems] = useCrudPermissions('configuration', 'billable-items');
  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');

  const requestPriceGroups = useCallback(() => {
    if (state?.id && state?.tab === PriceGroupsTab.customerJobSites) {
      setCurrentTab(navigationConfig[2]);
      priceGroupStore.requestById(state.id);
    }
  }, [state?.id, state?.tab, navigationConfig, priceGroupStore]);

  useEffect(() => {
    requestPriceGroups();
  }, [requestPriceGroups]);

  const handleRequest = useCallback(
    (tab?: PriceGroupsTab) => {
      if (!canViewPrices) {
        NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
        priceGroupStore.markLoaded();

        return;
      }

      priceGroupStore.request({ businessUnitId, businessLineId, type: tab ?? currentTab.key });
    },
    [businessLineId, businessUnitId, canViewPrices, currentTab.key, priceGroupStore],
  );

  useEffect(() => {
    if (currentTab.key === PriceGroupsTab.customerGroups && canViewCustomerGroups) {
      customerGroupStore.request();
    }
  }, [canViewCustomerGroups, currentTab.key, customerGroupStore]);

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  useEffect(() => {
    priceGroupStore.cleanup();
    handleRequest();
  }, [handleRequest, systemConfigurationStore.showInactive, priceGroupStore]);

  const handleChangeTab = useCallback(
    (newTab: NavigationConfigItem<PriceGroupsTab>) => {
      setCurrentTab(newTab);
      priceGroupStore.cleanup();
    },
    [priceGroupStore],
  );

  useCleanup(priceGroupStore);

  const handleOpenRatesClick = useCallback(
    (item: PriceGroup) => {
      if (!systemConfigurationStore.isCreating) {
        priceGroupStore.selectEntity(item, false);
        priceGroupStore.toggleRatesQuickView();
      }
    },
    [priceGroupStore, systemConfigurationStore],
  );

  const handlePriceGroupRowClick = (item: PriceGroup) => {
    if (priceGroupStore.isOpenRatesQuickView) {
      priceGroupStore.selectEntity(item, false);
    } else {
      priceGroupStore.selectEntity(item);
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLOrSVGElement>, item: PriceGroup) => {
      if (handleEnterOrSpaceKeyDown(e)) {
        handleOpenRatesClick(item);
      }
    },
    [handleOpenRatesClick],
  );

  return (
    <TablePageContainer>
      <Helmet title={t('Titles.PriceGroups')} />
      <PageHeader buttonRef={newButtonRef} />

      <TableTools.ScrollContainer
        tableNavigation={
          <TableTools.HeaderNavigation
            navigationRef={navigationRef}
            selectedTab={currentTab}
            tabs={navigationConfig}
            onChangeTab={handleChangeTab}
          />
        }
      >
        <PriceGroupQuickView
          tableScrollContainerRef={navigationRef}
          tbodyContainerRef={tbodyContainerRef}
          newButtonRef={newButtonRef}
          condition={
            priceGroupStore.isOpenQuickView ||
            systemConfigurationStore.isCreating ||
            systemConfigurationStore.isDuplicating
          }
          store={priceGroupStore}
          currentTab={currentTab}
          onRequest={handleRequest}
          shouldDeselect={
            !priceGroupStore.isOpenRatesQuickView
              ? !priceGroupStore.isOpenBulkEditQuickView
              : undefined
          }
        />
        <PriceGroupRatesQuickView
          tableScrollContainerRef={navigationRef}
          tbodyContainerRef={tbodyContainerRef}
          newButtonRef={newButtonRef}
          store={priceGroupStore}
          condition={priceGroupStore.isOpenRatesQuickView}
        />
        <BulkRatesEditQuickView
          tableScrollContainerRef={navigationRef}
          tbodyContainerRef={tbodyContainerRef}
          newButtonRef={newButtonRef}
          store={priceGroupStore}
          condition={priceGroupStore.isOpenBulkEditQuickView}
          shouldDeselect={!priceGroupStore.isOpenRatesQuickView || !priceGroupStore.isOpenQuickView}
        />

        <Table>
          <TableTools.Header>
            <TableTools.HeaderCell minWidth={50 + 48}>
              {t(`${I18N_PATH}Status`)}
            </TableTools.HeaderCell>
            {currentTab.key === PriceGroupsTab.customerGroups ? (
              <TableTools.HeaderCell>{t(`${I18N_PATH}CustomerGroup`)}</TableTools.HeaderCell>
            ) : null}
            <TableTools.HeaderCell minWidth={76 + 48}>
              {t(`${I18N_PATH}StartDate`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={76 + 48}>
              {t(`${I18N_PATH}EndDate`)}
            </TableTools.HeaderCell>
            <TableTools.HeaderCell>{t(`${I18N_PATH}Description`)}</TableTools.HeaderCell>
            <TableTools.HeaderCell minWidth={200}>
              {t(`${I18N_PATH}RackRates`)}
            </TableTools.HeaderCell>
          </TableTools.Header>
          <TableBody
            cells={currentTab.key === PriceGroupsTab.customerGroups ? 6 : 5}
            ref={tbodyContainerRef}
            loading={priceGroupStore.loading}
          >
            {priceGroups?.map(item => (
              <TableRow
                key={item.id}
                className={configurationStyle.customRow}
                onClick={() => {
                  handlePriceGroupRowClick(item);
                }}
                selected={selectedPriceGroup?.id === item.id}
              >
                <TableCell>
                  <StatusBadge active={item.active} />
                </TableCell>
                {currentTab.key === PriceGroupsTab.customerGroups ? (
                  <TableCell titleClassName={configurationStyle.tableCellTitle}>
                    {customerGroupStore.getById(item.customerGroupId)?.description}
                  </TableCell>
                ) : null}
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item?.startDate ? formatDateTime(item.startDate).date : null}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item?.endDate ? formatDateTime(item.endDate).date : null}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item.description}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellAction}>
                  {canViewBillableItems && canViewMaterials && canViewEquipment ? (
                    <Typography
                      color="information"
                      variant="bodyMedium"
                      cursor="pointer"
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => handleKeyDown(e, item)}
                      onClick={() => handleOpenRatesClick(item)}
                    >
                      {t(`${I18N_PATH}EditRackRates`)}
                    </Typography>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TableInfiniteScroll
          onLoaderReached={handleRequest}
          loaded={priceGroupStore.loaded}
          loading={priceGroupStore.loading}
          initialRequest={false}
        >
          Loading Price Groups
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(PriceGroupsTable);
