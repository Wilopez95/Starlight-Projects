import React, { useCallback, useEffect, useRef } from 'react';
import { Route, Switch } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { IWorkOrdersDailyRouteParams } from '@root/api/workOrdersDailyRoute';
import { DropDownSearch, ISearchDropDownItem, NothingToShowSidebar } from '@root/common';
import { Paths } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useDailyRoutesMap } from '@root/providers/DailyRoutesMapProvider';
import { useMapBounds } from '@root/providers/MapBoundsProvider';

import { ITabProps } from '../../types';
import { CUDailyRouteForm } from '../quickViews/DailyRouteQuickView';
import { DetailsQuickView } from '../quickViews/DetailsQuickView';
import FiltersQuickView from '../quickViews/FiltersQuickView';

import { List } from './List';

const ListSection: React.FC<ITabProps> = ({ tableNavigationRef }) => {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const { fitToMarkers } = useMapBounds();
  const { clearCustomized, setPopupInfo } = useDailyRoutesMap();

  const { dailyRoutesStore, businessLineStore, workOrderDailyRouteStore } = useStores();

  const { businessUnitId } = useBusinessContext();

  const businessLines = businessLineStore.currentBusinessLines;

  const onFilterModalClose = useCallback(() => {
    dailyRoutesStore.toggleFiltersRouteQuickView();
  }, [dailyRoutesStore]);

  const request = useCallback(
    async (filterOptions: Omit<IWorkOrdersDailyRouteParams, 'serviceDate'>) => {
      if (filterOptions.businessLineId) {
        await workOrderDailyRouteStore.getWorkOrderWithDailyRouteList(
          businessUnitId,
          filterOptions,
        );

        if (dailyRoutesStore.isFiltersModalOpen) {
          onFilterModalClose();
        }

        fitToMarkers();
      }
    },
    [businessUnitId, workOrderDailyRouteStore, dailyRoutesStore, onFilterModalClose, fitToMarkers],
  );

  const onSubmitFiltersOptions = useCallback(
    (data: Omit<IWorkOrdersDailyRouteParams, 'serviceDate'>) => {
      request(data);
    },
    [request],
  );

  const onCUDailyFormClose = useCallback(() => {
    clearCustomized();

    dailyRoutesStore.toggleDailyRouteModalSettings({
      visible: false,
      dailyRoute: undefined,
    });
  }, [dailyRoutesStore, clearCustomized]);

  useEffect(() => {
    if (!businessLines.length) {
      return;
    }

    const load = async () => {
      await Promise.all([
        dailyRoutesStore.getDailyRoutesListExpanded(businessUnitId, undefined, {
          resetOffset: true,
          cleanUp: true,
        }),
        dailyRoutesStore.getCount(businessUnitId),

        request({
          businessLineId: workOrderDailyRouteStore.businessLineId ?? businessLines[0]?.id,
          equipmentItemIds: workOrderDailyRouteStore.equipmentItemIds,
          materialIds: workOrderDailyRouteStore.materialIds,
          serviceAreaIds: workOrderDailyRouteStore.serviceAreaIds,
        }),
      ]);
    };

    load();
  }, [
    dailyRoutesStore,
    workOrderDailyRouteStore,
    dailyRoutesStore.selectedServiceDate,
    businessLines,
    businessUnitId,
    request,
  ]);

  const onCloseSearchDropdown = useCallback(() => {
    workOrderDailyRouteStore.setShowSearchedServiceItems(false);
  }, [workOrderDailyRouteStore]);

  const onDropDownItemClick = (arg: ISearchDropDownItem) => {
    setPopupInfo({
      jobSiteId: arg.jobSiteId,
      rootMarkerId: arg.rootMarkerId,
      coordinates: arg.coordinates,
      pinItemId: arg.id,
      jobSiteGroupedItems: undefined,
      color: '',
    });

    onCloseSearchDropdown();
  };

  return (
    <Layouts.Box
      minWidth="360px"
      position="relative"
      ref={mainContainerRef}
      backgroundColor="white"
      backgroundShade="standard"
    >
      {dailyRoutesStore.noResult ? <NothingToShowSidebar /> : <List />}
      <Switch>
        <Route path={Paths.DispatchModule.DailyRoute} exact>
          <DetailsQuickView mainContainerRef={mainContainerRef} />
        </Route>
      </Switch>
      <FiltersQuickView
        onSubmitFiltersOptions={onSubmitFiltersOptions}
        onClose={onFilterModalClose}
        mainContainerRef={tableNavigationRef}
      />
      <CUDailyRouteForm onClose={onCUDailyFormClose} mainContainerRef={tableNavigationRef} />
      {workOrderDailyRouteStore.showSearchedServiceItems ? (
        <DropDownSearch
          items={workOrderDailyRouteStore.searchedServiceItems}
          onClick={onDropDownItemClick}
          onClickOut={onCloseSearchDropdown}
        />
      ) : null}
    </Layouts.Box>
  );
};

export default observer(ListSection);
