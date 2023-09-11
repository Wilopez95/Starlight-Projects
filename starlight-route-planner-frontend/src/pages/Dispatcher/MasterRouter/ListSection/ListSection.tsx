import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Switch } from 'react-router';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { IHaulingServiceItemsParams } from '@root/api/haulingServiceItems/types';
import { DropDownSearch, ISearchDropDownItem, NothingToShowSidebar } from '@root/common';
import { Paths } from '@root/consts';
import { useBusinessContext, useStores } from '@root/hooks';
import { useMapBounds } from '@root/providers/MapBoundsProvider';
import { useMasterRoutesMap } from '@root/providers/MasterRoutesMapProvider';
import { setStoredFiltering, getStoredFiltering } from '@root/helpers/storedFiltering';

import { ITabProps } from '../../types';
import { DetailsQuickView } from '../quickViews/DetailsQuickView';
import FiltersQuickView from '../quickViews/FiltersQuickView';
import MasterRouteQuickView from '../quickViews/MasterRouteQuickView';

import { List } from './List';

const ListSection: React.FC<ITabProps> = ({ tableNavigationRef }) => {
  const mainContainerRef = useRef<HTMLDivElement | null>(null);
  const { clearCustomized, setPopupInfo } = useMasterRoutesMap();
  const { fitToMarkers } = useMapBounds();
  const [ sharedFiltering, setSharedFiltering] = useState<IHaulingServiceItemsParams | null>(null);

  const {
    masterRoutesStore,
    businessLineStore,
    serviceAreaStore,
    materialStore,
    equipmentItemStore,
    haulingServiceItemStore,
  } = useStores();

  const { businessUnitId } = useBusinessContext();
  const businessLines = businessLineStore.currentBusinessLines;

  const onFilterModalClose = useCallback(() => {
    masterRoutesStore.toggleFiltersRouteQuickView();
  }, [masterRoutesStore]);

  const onNewMasterRouteClose = useCallback(() => {
    // When user close modal clean all customized markers
    clearCustomized();
    masterRoutesStore.toggleMasterRouteModalSettings({
      visible: false,
    });
  }, [masterRoutesStore, clearCustomized]);

  window.onfocus = () =>{
    const storedFiltering: IHaulingServiceItemsParams | null = getStoredFiltering();
    if (storedFiltering){
      setSharedFiltering(storedFiltering);
    }
  }

  const requestServiceItems = useCallback(
    async (filterOptions: IHaulingServiceItemsParams, isNotFirstLoad: boolean = true) => {
      if (isNotFirstLoad){
        setStoredFiltering(filterOptions);
      }
      await haulingServiceItemStore.getHaulingServiceItems(businessUnitId, filterOptions);
      await masterRoutesStore.getMasterRoutesList(businessUnitId, { input: filterOptions });
      if (masterRoutesStore.isFiltersModalOpen) {
        onFilterModalClose();
      }

      fitToMarkers();
    },
    [businessUnitId, haulingServiceItemStore, masterRoutesStore, onFilterModalClose, fitToMarkers],
  );

  useEffect(() => {
    if (!businessLines.length) {
      return;
    }

    const load = async () => {
      const defaultFilters = {
        businessLineId: businessLines[0]?.id,
        frequencyIds: [],
      };
      const storedFiltering: IHaulingServiceItemsParams | null = getStoredFiltering();
      await Promise.all([
        requestServiceItems(storedFiltering? storedFiltering: defaultFilters, false),
        masterRoutesStore.getMasterRoutesList(businessUnitId),
        masterRoutesStore.getCount(businessUnitId),
      ]);
    };

    load();
  }, [
    requestServiceItems,
    businessLines,
    serviceAreaStore,
    materialStore,
    equipmentItemStore,
    masterRoutesStore,
    businessUnitId,
  ]);

  useEffect(()=>{
    if (sharedFiltering){
      requestServiceItems(sharedFiltering);
    }
  }, [sharedFiltering])

  const onCloseSearchDropdown = useCallback(() => {
    haulingServiceItemStore.setShowSearchedServiceItems(false);
  }, [haulingServiceItemStore]);

  // interface IserviceItem {
  //   jobSiteId: number;
  //   rootMarkerId: number;
  //   coordinates: Position;
  //   id?: number;
  // }

  const onDropDownItemClick = (serviceItem: ISearchDropDownItem) => {
    setPopupInfo({
      jobSiteId: serviceItem.jobSiteId,
      rootMarkerId: serviceItem.rootMarkerId,
      coordinates: serviceItem.coordinates,
      // Todo fix the error Type 'number | undefined' is not assignable to type 'number' on the pinItemId
      pinItemId: serviceItem.id,
      jobSiteGroupedItems: [],
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
      {masterRoutesStore.noResult ? <NothingToShowSidebar /> : <List />}
      <Switch>
        <Route path={Paths.DispatchModule.MasterRoute} exact>
          <DetailsQuickView mainContainerRef={mainContainerRef} />
        </Route>
      </Switch>
      <FiltersQuickView
        onSubmitFiltersOptions={requestServiceItems}
        onClose={onFilterModalClose}
        mainContainerRef={tableNavigationRef}
      />
      <MasterRouteQuickView onClose={onNewMasterRouteClose} mainContainerRef={tableNavigationRef} />
      {haulingServiceItemStore.showSearchedServiceItems && (
        <DropDownSearch
          items={haulingServiceItemStore.searchedServiceItems}
          onClick={onDropDownItemClick}
          onClickOut={onCloseSearchDropdown}
        />
      )}
    </Layouts.Box>
  );
};

export default observer(ListSection);
