import React from 'react';
import { Marker } from 'react-map-gl';
import { HomeYardPinIcon, LandfillPinIcon } from '@starlightpro/shared-components';

import { WayPointType } from '@root/consts';

import { IWayPointMarkerProps } from './types';

const DEFAULT_PIN_HEIGHT = 50;
const DEFAULT_PIN_WIDTH = 50;

export const WayPointMarker: React.FC<IWayPointMarkerProps> = ({ data, onClick }) => {
  const {
    location: { coordinates },
    type,
  } = data;

  const Pin = {
    [WayPointType.HOME_YARD]: HomeYardPinIcon,
    [WayPointType.LANDFILL]: LandfillPinIcon,
  }[type];

  if (!Pin) {
    return null;
  }

  const handleClick = () => {
    onClick?.(data);
  };

  return (
    <div onClick={handleClick}>
      <Marker longitude={coordinates[0] || 0} latitude={coordinates[1] || 0}>
        <Pin
          style={{
            width: DEFAULT_PIN_WIDTH,
            height: DEFAULT_PIN_HEIGHT,
            cursor: 'pointer',
          }}
          viewBox={`0 0 ${DEFAULT_PIN_WIDTH} ${DEFAULT_PIN_HEIGHT}`}
        />
      </Marker>
    </div>
  );
};
