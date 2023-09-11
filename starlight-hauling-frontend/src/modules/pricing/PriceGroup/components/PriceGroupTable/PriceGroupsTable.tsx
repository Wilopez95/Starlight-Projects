import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
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

import { ISystemConfigurationTable } from '../../../../../pages/SystemConfiguration/types';
import BulkRatesEditQuickView from '../../../CustomRate/components/quickViews/CustomRateBulkEditQuickView/CustomRateBulkEditQuickView';
import PriceGroupRatesQuickView from '../../../CustomRate/components/quickViews/CustomRateTableQuickView/CustomRateTableQuickView';
import { PriceGroup } from '../../store/PriceGroup';
import PriceGroupQuickView from '../quickViews/PriceGroupTableQuickView/PriceGroupTableQuickView';

import configurationStyle from '../../../../../pages/SystemConfiguration/css/styles.scss';
import PageHeader from './PageHeader/PageHeader';
import { useNavigation } from './hooks';
import { PriceGroupsTab } from './types';

const I18N_PATH = 'modules.pricing.PriceGroup.components.PriceGroupTable.Text.';

const PriceGroupsTable: React.FC<ISystemConfigurationTable> = () => {
  const {
    businessLineStore,
    priceGroupStoreNew,
    customerGroupStore,
    systemConfigurationStore,
    customRateStoreNew,
  } = useStores();
  const newButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  const tbodyContainerRef = useRef(null);
  const { formatDateTime } = useIntl();
  const { t } = useTranslation();

  useCleanup(priceGroupStoreNew);

  const { businessLineId, businessUnitId } = useBusinessContext();

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const navigationConfig = useNavigation(isRecyclingLoB);

  const [currentTab, setCurrentTab] = useState(navigationConfig[0]);

  const selectedPriceGroup = priceGroupStoreNew.selectedEntity;
  const priceGroups = priceGroupStoreNew.sortedValues;

  const [canViewPrices] = useCrudPermissions('configuration/price-groups', 'price-groups');
  const [canViewBillableItems] = useCrudPermissions('configuration', 'billable-items');
  const [canViewMaterials] = useCrudPermissions('configuration', 'materials');
  const [canViewEquipment] = useCrudPermissions('configuration', 'equipment');

  const handleRequest = useCallback(
    (tab?: PriceGroupsTab) => {
      if (!canViewPrices) {
        NotificationHelper.error('default', ActionCode.ACCESS_DENIED);
        priceGroupStoreNew.markLoaded();

        return;
      }

      priceGroupStoreNew.request({ businessUnitId, businessLineId, type: tab ?? currentTab.key });
    },
    [businessLineId, businessUnitId, canViewPrices, currentTab.key, priceGroupStoreNew],
  );

  useEffect(() => {
    businessLineStore.request();
  }, [businessLineStore]);

  const handleChangeTab = useCallback(
    (newTab: NavigationConfigItem<PriceGroupsTab>) => {
      setCurrentTab(newTab);
      priceGroupStoreNew.cleanup();
      handleRequest(newTab.key);
    },
    [handleRequest, priceGroupStoreNew],
  );

  const handleOpenRatesClick = useCallback(
    (item: PriceGroup) => {
      if (!systemConfigurationStore.isCreating) {
        priceGroupStoreNew.selectEntity(item, false);
        customRateStoreNew.toggleRatesQuickView();
      }
    },
    [customRateStoreNew, priceGroupStoreNew, systemConfigurationStore.isCreating],
  );

  const handlePriceGroupRowClick = (item: PriceGroup) => {
    if (customRateStoreNew.isOpenRatesQuickView) {
      priceGroupStoreNew.selectEntity(item, false);
    } else {
      priceGroupStoreNew.selectEntity(item);
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
      <PriceGroupQuickView
        tableScrollContainerRef={navigationRef}
        tbodyContainerRef={tbodyContainerRef}
        newButtonRef={newButtonRef}
        condition={
          priceGroupStoreNew.isOpenQuickView ||
          systemConfigurationStore.isCreating ||
          systemConfigurationStore.isDuplicating
        }
        store={priceGroupStoreNew}
        currentTab={currentTab}
        onRequest={handleRequest}
        shouldDeselect={
          !customRateStoreNew.isOpenRatesQuickView
            ? !priceGroupStoreNew.isOpenBulkEditQuickView
            : undefined
        }
      />
      <PriceGroupRatesQuickView
        tableScrollContainerRef={navigationRef}
        tbodyContainerRef={tbodyContainerRef}
        newButtonRef={newButtonRef}
        store={priceGroupStoreNew}
        condition={customRateStoreNew.isOpenRatesQuickView}
      />
      <BulkRatesEditQuickView
        tableScrollContainerRef={navigationRef}
        tbodyContainerRef={tbodyContainerRef}
        newButtonRef={newButtonRef}
        store={priceGroupStoreNew}
        condition={priceGroupStoreNew.isOpenBulkEditQuickView}
        shouldDeselect={
          !customRateStoreNew.isOpenRatesQuickView || !priceGroupStoreNew.isOpenQuickView
        }
      />

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
            loading={priceGroupStoreNew.loading}
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
                  {item?.startAt ? formatDateTime(item.startAt).date : null}
                </TableCell>
                <TableCell titleClassName={configurationStyle.tableCellTitle}>
                  {item?.endAt ? formatDateTime(item.endAt).date : null}
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
          loaded={priceGroupStoreNew.loaded}
          loading={priceGroupStoreNew.loading}
        >
          {t(`${I18N_PATH}LoadingPriceGroups`)}
        </TableInfiniteScroll>
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(PriceGroupsTable);
