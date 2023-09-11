import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Layouts } from '@starlightpro/shared-components';
import { startCase } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';
import {
  Divider,
  Table,
  TableBody,
  TableCell,
  TablePageContainer,
  TableRow,
  TableTools,
} from '@root/common/TableTools';
import { StatusBadge } from '@root/components';
import { actionLabelsOverrides, BillableItemActionEnum, billingCycleLabels } from '@root/consts';
import { NotificationHelper } from '@root/helpers';
import { ActionCode } from '@root/helpers/notifications/types';
import { buildI18Path } from '@root/i18n/helpers';
import { ISystemConfigurationTable } from '@root/pages/SystemConfiguration/types';
import { BillableItemsQuickView } from '@root/quickViews';
import { BillableService, LineItem, Surcharge, Threshold } from '@root/stores/entities';
import { useBusinessContext, useCrudPermissions, useStores } from '@hooks';

import PageHeader from '../../../../components/PageHeader/PageHeader';

import configurationStyle from '../../../../css/styles.scss';
import { useNavigation } from './hooks';
import SurchargesTable from './SurchargesTable';
import { BillableItemType, BillableItemTypes, NavigationItem } from './types';

const I18N_PATH = buildI18Path(
  'pages.SystemConfiguration.tables.BusinessLinesConfiguration.tables.BillableItems.',
);

const actionLabels = actionLabelsOverrides as Record<BillableItemActionEnum, string>;

const getButtonTitle = (type: BillableItemTypes) => {
  switch (type) {
    case BillableItemType.service:
      return `${I18N_PATH.Text}AddNewOneTimeService`;
    case BillableItemType.recurringService:
      return `${I18N_PATH.Text}AddNewRecurringService`;
    case BillableItemType.lineItem:
      return `${I18N_PATH.Text}AddNewLineItem`;
    case BillableItemType.recurringLineItem:
      return `${I18N_PATH.Text}AddNewRecurringLineItem`;
    case BillableItemType.threshold:
      return 'Text.__Empty';
    case BillableItemType.surcharge:
      return `${I18N_PATH.Text}AddSurcharge`;
    default:
      return '';
  }
};

const BillableItemsTable: React.FC<ISystemConfigurationTable> = ({ className }) => {
  const { t } = useTranslation();

  const newButtonRef = useRef<HTMLButtonElement>(null);
  const navigationRef = useRef<HTMLDivElement>(null);

  const { businessLineId } = useBusinessContext();
  const [canViewBillableItems, _, canCreateBillableItems] = useCrudPermissions(
    'configuration',
    'billable-items',
  );

  const {
    businessLineStore,
    billableServiceStore,
    lineItemStore,
    thresholdStore,
    systemConfigurationStore,
    surchargeStore,
    materialStore,
  } = useStores();
  const tbodyContainerRef = useRef(null);

  const isRecyclingLoB = businessLineStore.isRecyclingType(businessLineId);

  const tabs = useNavigation(isRecyclingLoB);
  const [selectedTab, setSelectedTab] = useState<NavigationItem>(tabs[0]);

  const selectedStore = useMemo(() => {
    switch (selectedTab.key) {
      case BillableItemType.service:
      case BillableItemType.recurringService:
        return billableServiceStore;
      case BillableItemType.lineItem:
      case BillableItemType.recurringLineItem:
        return lineItemStore;
      case BillableItemType.threshold:
        return thresholdStore;
      case BillableItemType.surcharge:
        return surchargeStore;
      default:
        return billableServiceStore;
    }
  }, [billableServiceStore, lineItemStore, selectedTab.key, surchargeStore, thresholdStore]);

  const handleChangeTab = useCallback(
    (newTab: NavigationItem) => {
      selectedStore.unSelectEntity();
      setSelectedTab(newTab);
    },
    [selectedStore],
  );

  const tripCharge = useRef<LineItem | undefined>();
  const recyclingServices =
    BillableItemType.service === selectedTab.key
      ? (selectedStore.sortedValues as BillableService[]).filter(service => {
          return [BillableItemActionEnum.dump, BillableItemActionEnum.load].includes(
            service.action,
          );
        })
      : [];

  const billableItems: (BillableService | LineItem | Threshold | Surcharge)[] = useMemo(
    () =>
      [BillableItemType.lineItem, BillableItemType.recurringLineItem].includes(selectedTab.key)
        ? lineItemStore.sortedValues.filter(lineItem => {
            const takeOneTime = selectedTab.key === BillableItemType.lineItem;

            if (takeOneTime && lineItem.type === 'tripCharge') {
              tripCharge.current = lineItem;

              return false;
            }

            return lineItem.oneTime === takeOneTime;
          })
        : [BillableItemType.service, BillableItemType.recurringService].includes(selectedTab.key)
        ? (selectedStore.sortedValues as BillableService[]).filter(service => {
            const takeOneTime = selectedTab.key === BillableItemType.service;

            if (
              takeOneTime &&
              [BillableItemActionEnum.dump, BillableItemActionEnum.load].includes(service.action)
            ) {
              return false;
            }

            return service.oneTime === takeOneTime;
          })
        : selectedStore.sortedValues,
    [selectedTab.key, selectedStore.sortedValues, lineItemStore],
  );

  useEffect(() => {
    if (!canViewBillableItems) {
      NotificationHelper.error('default', ActionCode.ACCESS_DENIED);

      return;
    }

    // TODO: move cleanup to request function and check all places where they are used
    billableServiceStore.cleanup();
    lineItemStore.cleanup();
    thresholdStore.cleanup();
    surchargeStore.cleanup();
    billableServiceStore.request({ businessLineId });
    lineItemStore.request({ businessLineId });
    thresholdStore.request({ businessLineId });
    surchargeStore.request({ businessLineId });
    materialStore.request({ businessLineId });
  }, [
    billableServiceStore,
    lineItemStore,
    thresholdStore,
    businessLineId,
    surchargeStore,
    materialStore,
    canViewBillableItems,
  ]);

  return (
    <TablePageContainer className={className}>
      <Helmet title={t('Titles.BillableItems')} />
      <PageHeader
        button={canCreateBillableItems ? t(getButtonTitle(selectedTab.key)) : undefined}
        title={t(`${I18N_PATH.Text}BillableItems`)}
        hideActions={isRecyclingLoB ? selectedTab.key === BillableItemType.service : undefined}
        hideSwitch={selectedTab.key === BillableItemType.threshold}
        buttonRef={newButtonRef}
      />

      <TableTools.ScrollContainer
        tableNavigation={
          <TableTools.HeaderNavigation
            navigationRef={navigationRef}
            selectedTab={selectedTab}
            tabs={tabs}
            onChangeTab={handleChangeTab}
          />
        }
      >
        <BillableItemsQuickView
          clickOutContainers={tbodyContainerRef}
          selectedTab={selectedTab.key}
          isOpen={selectedStore.isOpenQuickView || systemConfigurationStore.isCreating}
          quickViewSubtitle={selectedTab.subtitle}
        />
        {selectedTab.key === BillableItemType.surcharge ? (
          <SurchargesTable />
        ) : (
          <Table>
            <TableTools.Header>
              {selectedTab.key === BillableItemType.threshold ? (
                <TableTools.HeaderCell minWidth={50 + 48}>Description</TableTools.HeaderCell>
              ) : (
                <TableTools.HeaderCell minWidth={50 + 48}>Status</TableTools.HeaderCell>
              )}
              {selectedTab.key === BillableItemType.threshold ? (
                <TableTools.HeaderCell minWidth={50 + 48}>Threshold Type</TableTools.HeaderCell>
              ) : (
                <TableTools.HeaderCell>Description</TableTools.HeaderCell>
              )}
              {selectedTab.key === BillableItemType.lineItem ? (
                <TableTools.HeaderCell>Line Item Type</TableTools.HeaderCell>
              ) : null}
              {selectedTab.key === BillableItemType.service ||
              selectedTab.key === BillableItemType.recurringService ? (
                <>
                  {!isRecyclingLoB ? (
                    <TableTools.HeaderCell key="equipment">Equipment</TableTools.HeaderCell>
                  ) : null}
                  <TableTools.HeaderCell key="action">Action</TableTools.HeaderCell>
                </>
              ) : null}
              {selectedTab.key === BillableItemType.recurringService ||
              selectedTab.key === BillableItemType.recurringLineItem ? (
                <TableTools.HeaderCell key="cycle">Billing Cycle</TableTools.HeaderCell>
              ) : null}
            </TableTools.Header>
            <TableBody ref={tbodyContainerRef} cells={3} loading={selectedStore.loading}>
              {!isRecyclingLoB &&
              tripCharge.current &&
              selectedTab.key === BillableItemType.lineItem ? (
                <>
                  <TableRow
                    key={tripCharge.current.id}
                    className={configurationStyle.customRow}
                    onClick={() => {
                      lineItemStore.selectEntity(tripCharge.current as LineItem);
                    }}
                    selected={lineItemStore.selectedEntity?.id === tripCharge.current.id}
                  >
                    <TableCell>
                      <StatusBadge active={tripCharge.current.active} />
                    </TableCell>
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {tripCharge.current.description}
                    </TableCell>
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      <Typography fontWeight="bold">
                        {startCase(tripCharge.current.type)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                  <Divider colSpan={4} />
                </>
              ) : null}
              {selectedTab.key === BillableItemType.service && recyclingServices.length > 0 ? (
                <>
                  {recyclingServices.map(service => (
                    <TableRow
                      key={service.id}
                      className={configurationStyle.customRow}
                      onClick={() => {
                        billableServiceStore.selectEntity(service);
                      }}
                      selected={selectedStore.selectedEntity?.id === service.id}
                    >
                      <TableCell>
                        <StatusBadge active={service.active} />
                      </TableCell>
                      <TableCell titleClassName={configurationStyle.tableCellTitle}>
                        {service.description}
                      </TableCell>
                      <TableCell titleClassName={configurationStyle.tableCellTitle} capitalize>
                        {actionLabels[service.action] || service.action}
                      </TableCell>
                    </TableRow>
                  ))}
                  <Divider colSpan={4} />
                </>
              ) : null}
              {billableItems.map(item => (
                <TableRow
                  key={item.id}
                  className={configurationStyle.customRow}
                  onClick={() => {
                    selectedStore.selectEntity(item as never);
                  }}
                  selected={selectedStore.selectedEntity?.id === item.id}
                >
                  {selectedTab.key === BillableItemType.threshold ? (
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {item.description}
                    </TableCell>
                  ) : (
                    <TableCell>
                      <StatusBadge active={item.active} />
                    </TableCell>
                  )}
                  {selectedTab.key === BillableItemType.threshold ? (
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {startCase((item as Threshold).type)}
                    </TableCell>
                  ) : (
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {item.description}
                    </TableCell>
                  )}
                  {selectedTab.key === BillableItemType.lineItem ? (
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {startCase((item as LineItem).type)}
                    </TableCell>
                  ) : null}
                  {selectedTab.key === BillableItemType.recurringLineItem ? (
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {(item as LineItem).billingCycles
                        ?.map(billingCycle => billingCycleLabels[billingCycle])
                        .join(', ')}
                    </TableCell>
                  ) : null}
                  {(selectedTab.key === BillableItemType.service ||
                    selectedTab.key === BillableItemType.recurringService) &&
                  !isRecyclingLoB ? (
                    <>
                      <TableCell titleClassName={configurationStyle.tableCellTitle}>
                        {startCase((item as BillableService).equipmentItem?.description)}
                        {(item as BillableService).equipmentItem?.customerOwned ? (
                          <Layouts.Margin left="1">
                            <Typography color="secondary" shade="desaturated">
                              ({t(`${I18N_PATH.Text}COE`)})
                            </Typography>
                          </Layouts.Margin>
                        ) : null}
                      </TableCell>
                      <TableCell titleClassName={configurationStyle.tableCellTitle} capitalize>
                        {actionLabels[(item as BillableService).action] ||
                          (item as BillableService).action}
                      </TableCell>
                    </>
                  ) : null}
                  {selectedTab.key === BillableItemType.recurringService ? (
                    <TableCell titleClassName={configurationStyle.tableCellTitle}>
                      {(item as BillableService).billingCycles
                        ?.map(billingCycle => billingCycleLabels[billingCycle])
                        .join(', ')}
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableTools.ScrollContainer>
    </TablePageContainer>
  );
};

export default observer(BillableItemsTable);
