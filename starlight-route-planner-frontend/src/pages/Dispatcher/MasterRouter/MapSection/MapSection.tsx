import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Map, NothingToShowMapLabel, PublishingProgress } from '@root/common';
import { useBusinessContext, usePolling, useStores } from '@root/hooks';
import { UnassignedJobSitesCount } from '@root/pages/Dispatcher/common/UnassignedJobSitesCount';
import { useMapSettings } from '@root/providers';
import { useMapBounds } from '@root/providers/MapBoundsProvider';
import { useMasterRoutesMap, useMergedMapData } from '@root/providers/MasterRoutesMapProvider';
import { IMapMergeData } from '@root/types';
import { MultipleServiceItemsInfoModal, Popup, WaypointDetails } from '@root/widgets/modals';

const I18N_PATH = 'pages.Dispatcher.components.Map.Text.';

const MapSection: React.FC = () => {
  const {
    getMasterRoutesMap,
    getCustomizedRoutes,
    customizedSet,
    showUnassignedJobSite,
    popupInfo,
    setPopupInfo,
  } = useMasterRoutesMap();
  const { mapRef, getMapCenterByLngLatPosition } = useMapBounds();
  const { jobSites, masterRoutesServiceItems, jobSitesCount, waypoints } =
    useMergedMapData(showUnassignedJobSite);

  const { waypointsStore } = useStores();
  const { toggleModal, isToggled: isMapSettingsModalToggled } = useMapSettings();
  const { t } = useTranslation();

  const { businessUnitId } = useBusinessContext();
  const { masterRoutesStore, haulingServiceItemStore } = useStores();

  const setPopupInfoWithFlyTo = useCallback(
    (data: IMapMergeData | undefined) => {
      if (data) {
        getMapCenterByLngLatPosition(data.coordinates);
        setPopupInfo(data);
      } else {
        //If data is undefined it will Clear the popup info
        setPopupInfo(data);
      }
    },
    [setPopupInfo, getMapCenterByLngLatPosition],
  );

  useEffect(() => {
    masterRoutesStore.clearUpdatingRoutesList();
  }, [businessUnitId, masterRoutesStore, masterRoutesStore.values]);

  usePolling(async () => {
    await masterRoutesStore.checkUpdatingRoutes(businessUnitId);
  }, 5000);

  return (
    <>
      <Map
        id="master-router-map"
        ref={mapRef}
        popupInfo={popupInfo}
        setPopupInfo={setPopupInfoWithFlyTo}
        toggleMapSettingsModal={toggleModal}
        isMapSettingsModalToggled={isMapSettingsModalToggled}
        mapStyle={[
          {
            id: 'master-routes',
            markers: masterRoutesServiceItems,
            showPopup: true,
            visible: true,
            filterMap: getMasterRoutesMap,
            draggable: true,
            showUnassignedJobSiteOnly: showUnassignedJobSite,
          },
          {
            id: 'customized',
            markers: customizedSet,
            showPopup: true,
            visible: false,
            filterMap: getCustomizedRoutes,
            draggable: true,
          },
          {
            id: 'root',
            markers: jobSites,
            showPopup: true,
            visible: true,
            filterMap: [],
            draggable: true,
          },
        ]}
        renderPopup={(data, onClose) => {
          //TODO: combine MultipleServiceItemsInfoModal and Popup components into one
          if (data.jobSiteGroupedItems && data.jobSiteGroupedItems.length > 1) {
            return (
              <MultipleServiceItemsInfoModal
                serviceItemsIds={data.jobSiteGroupedItems}
                onClose={onClose}
              />
            );
          }

          return (
            <Popup
              serviceItemId={data.pinItemId}
              masterRouteId={data.masterRouteId}
              onClosePopup={onClose}
            />
          );
        }}
        waypoints={waypoints}
        waypointPopupInfo={waypointsStore.popupInfo}
        setWaypointPopupInfo={waypointsStore.setPopupInfo}
        renderWaypointPopup={(onClose, data) => {
          return <WaypointDetails data={data} onClosePopup={onClose} />;
        }}
      >
        <PublishingProgress
          updatingRoutes={masterRoutesStore.currentlyUpdatingRoutes}
          onClose={() => masterRoutesStore.clearUpdatingRoutesList()}
        />
        {showUnassignedJobSite && (
          <UnassignedJobSitesCount>
            {t(`${I18N_PATH}UnassignedServicesCount`, {
              count: jobSites.length,
              outOfCount: jobSitesCount,
            })}
          </UnassignedJobSitesCount>
        )}
        {haulingServiceItemStore.noResult && <NothingToShowMapLabel />}
      </Map>
    </>
  );
};

export default observer(MapSection);
