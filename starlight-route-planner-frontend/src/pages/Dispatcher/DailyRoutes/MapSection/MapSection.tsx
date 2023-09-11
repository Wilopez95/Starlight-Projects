import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

import { Map, NothingToShowMapLabel } from '@root/common';
import { useStores } from '@root/hooks';
import { UnassignedJobSitesCount } from '@root/pages/Dispatcher/common/UnassignedJobSitesCount';
import { useMapSettings } from '@root/providers';
import { useDailyRoutesMap, useMergedMapData } from '@root/providers/DailyRoutesMapProvider';
import { useMapBounds } from '@root/providers/MapBoundsProvider';
import { WaypointDetails, WorkOrderDetailsModal } from '@root/widgets/modals';
import { IMapMergeData } from '@root/types';

const I18N_PATH = 'pages.Dispatcher.components.Map.Text.';

const MapSection: React.FC = () => {
  const {
    getDailyRoutesMap,
    getCustomizedRoutes,
    customizedSet,
    showUnassignedJobSite,
    popupInfo,
    setPopupInfo,
  } = useDailyRoutesMap();
  const { workOrderDailyRouteStore } = useStores();
  const { jobSites, dailyRoutesWorkOrders, jobSitesCount, waypoints } =
    useMergedMapData(showUnassignedJobSite);
  const { waypointsStore } = useStores();
  const { toggleModal, isToggled: isMapSettingsModalToggled } = useMapSettings();

  const { t } = useTranslation();
  const { mapRef, getMapCenterByLngLatPosition } = useMapBounds();

  const setPopupInfoWithFlyTo = useCallback(
    (data: IMapMergeData | undefined) => {
      if (data) {
        getMapCenterByLngLatPosition(data.coordinates);
      }
      setPopupInfo(data);
    },
    [setPopupInfo, getMapCenterByLngLatPosition],
  );

  return (
    <Map
      id="daily-routes-map"
      ref={mapRef}
      popupInfo={popupInfo}
      setPopupInfo={setPopupInfoWithFlyTo}
      toggleMapSettingsModal={toggleModal}
      isMapSettingsModalToggled={isMapSettingsModalToggled}
      mapStyle={[
        {
          id: 'root',
          markers: jobSites,
          showPopup: true,
          visible: true,
          filterMap: [],
          draggable: true,
        },
        {
          id: 'daily-routes',
          markers: dailyRoutesWorkOrders,
          showPopup: true,
          visible: false,
          filterMap: getDailyRoutesMap,
          draggable: true,
        },
        {
          id: 'customized',
          markers: customizedSet,
          showPopup: true,
          visible: false,
          filterMap: getCustomizedRoutes,
          draggable: true,
        },
      ]}
      renderPopup={(data, onClose) => {
        return <WorkOrderDetailsModal data={data} onClosePopup={onClose} />;
      }}
      waypoints={waypoints}
      waypointPopupInfo={waypointsStore.popupInfo}
      setWaypointPopupInfo={waypointsStore.setPopupInfo}
      renderWaypointPopup={(onClose, data) => {
        return <WaypointDetails data={data} onClosePopup={onClose} />;
      }}
    >
      {showUnassignedJobSite && (
        <UnassignedJobSitesCount>
          <>
            {t(`${I18N_PATH}UnassignedWorkOrdersCount`, {
              count: jobSites.length,
              outOfCount: jobSitesCount,
            })}
          </>
        </UnassignedJobSitesCount>
      )}
      {workOrderDailyRouteStore.noResult && <NothingToShowMapLabel />}
    </Map>
  );
};

export default observer(MapSection);
