/* eslint-disable @typescript-eslint/no-duplicate-imports */
/* eslint-disable import/no-duplicates */
import React, { useImperativeHandle, useRef, useState } from 'react';
import MapGL, { FlyToInterpolator, Popup, WebMercatorViewport } from 'react-map-gl';
import MapRef from 'react-map-gl'; //MapRef do not like to be imported in the same line as Mapgl
import { ClickOutHandler, Layouts } from '@starlightpro/shared-components';
import { noop } from 'lodash-es';
import { observer } from 'mobx-react-lite';

import { accessToken, defaultMapStyle, defaultZoom } from '@root/config/mapbox';
import { US_CENTROID } from '@root/consts/coords';
import { MapSettingsModal } from '@root/widgets/modals/MapSettingsModal/MapSettingsModal';

import { PIN_WIDTH } from '../Pin/helper';

import { getMarkersBoundingBox, POSITION_COORDINATES_DIVIDER } from './helper';
import { Layer } from './Layer';
import { SettingsButton } from './SettingsButton';
import { type IMap, IMapHandle } from './types';
import { WayPointsLayer } from './WayPointsLayer';

interface Viewport {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
  width?: number;
  height?: number;
}

const Map: React.ForwardRefRenderFunction<IMapHandle, IMap> = (
  {
    mapStyle,
    id,
    children,
    popupInfo,
    setPopupInfo,
    renderPopup,
    toggleMapSettingsModal,
    isMapSettingsModalToggled,
    waypoints,
    renderWaypointPopup,
    waypointPopupInfo,
    setWaypointPopupInfo,
  },
  ref,
) => {
  const mapWrapperRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapRef | null>(null);

  const [viewport, setViewport] = useState<Viewport>({
    latitude: US_CENTROID.coordinates[1],
    longitude: US_CENTROID.coordinates[0],
    zoom: defaultZoom,
    bearing: 0,
    pitch: 0,
  });

  const onClosePopup = () => {
    setPopupInfo?.(undefined);
  };
  const onCloseWayPointInfoPopup = () => {
    //if (setWaypointPopupInfo) { //removed cause of the error Unnecessary conditional, value is always truthy
    setWaypointPopupInfo(undefined);
    //}
  };

  useImperativeHandle(ref, () => ({
    fitToMarkers: coordinates => {
      // Base (Root) layer must always be first element
      const currentCoordinates = coordinates ? coordinates : mapStyle[0].markers;

      if (!currentCoordinates.length) {
        return false;
      }

      const boundingBox = getMarkersBoundingBox(currentCoordinates);

      if (!boundingBox) {
        return false;
      }

      const [south, west, north, east] = boundingBox;

      setViewport(viewportParam => {
        const NEXT_VIEWPORT = new WebMercatorViewport({
          ...viewportParam,
        }).fitBounds(
          [
            [south, west],
            [north, east],
          ],
          {
            padding: 60,
            //maxZoom: 16,
          },
        );

        return {
          ...NEXT_VIEWPORT,
          transitionDuration: 500,
          transitionInterpolator: new FlyToInterpolator(),
        };
      });

      return true;
    },
    getMapCenterByLngLatPosition: coordinates => {
      if (!coordinates?.length) {
        return false;
      }

      setViewport(viewportParam => {
        const [longitude, latitude] = new WebMercatorViewport({
          ...(viewportParam as WebMercatorViewport),
        }).getMapCenterByLngLatPosition({
          lngLat: [coordinates[0], coordinates[1]],
          pos: [
            (mapWrapperRef.current?.clientWidth ?? 0) / POSITION_COORDINATES_DIVIDER,
            (mapWrapperRef.current?.clientHeight ?? 0) / POSITION_COORDINATES_DIVIDER,
          ],
        });

        return {
          ...viewportParam,
          latitude,
          longitude,
          transitionDuration: 500,
          transitionInterpolator: new FlyToInterpolator(),
        };
      });

      return true;
    },
  }));

  return (
    <Layouts.Box ref={mapWrapperRef} width="100%" position="relative" id={id}>
      <MapGL
        ref={mapRef}
        mapStyle={defaultMapStyle}
        onViewportChange={(viewportEvent: Viewport) => setViewport(viewportEvent)}
        mapboxApiAccessToken={accessToken}
        width="100%"
        height="100%"
        {...viewport}
      >
        {waypoints.length > 0 && (
          <WayPointsLayer markers={waypoints} onPopup={setWaypointPopupInfo} />
        )}
        {mapStyle.map(map => (
          <Layer
            key={map.id}
            {...map}
            onPopup={map.showPopup ? setPopupInfo : undefined}
            selectedJobSiteId={popupInfo ? popupInfo.jobSiteId : undefined}
          />
        ))}
        {popupInfo && (
          <ClickOutHandler onClickOut={onClosePopup}>
            <Popup
              offsetLeft={PIN_WIDTH + 4}
              anchor="bottom-left"
              longitude={popupInfo.coordinates[0]}
              latitude={popupInfo.coordinates[1]}
              closeOnClick={false}
              onClose={setPopupInfo}
              closeButton={false}
              tipSize={0}
            >
              {renderPopup(popupInfo, onClosePopup)}
            </Popup>
          </ClickOutHandler>
        )}
        <SettingsButton onClick={toggleMapSettingsModal} />
        {isMapSettingsModalToggled && <MapSettingsModal />}
        {waypointPopupInfo && (
          <ClickOutHandler onClickOut={onCloseWayPointInfoPopup}>
            <Popup
              offsetTop={-10}
              longitude={waypointPopupInfo.location.coordinates[0]}
              latitude={waypointPopupInfo.location.coordinates[1]}
              closeOnClick={false}
              onClose={noop}
              closeButton={false}
              tipSize={0}
            >
              {renderWaypointPopup(onCloseWayPointInfoPopup, waypointPopupInfo)}
            </Popup>
          </ClickOutHandler>
        )}
      </MapGL>
      {children}
    </Layouts.Box>
  );
};

export default observer(Map, { forwardRef: true });
