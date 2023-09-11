import React from 'react';
import { HTMLOverlay } from 'react-map-gl';

import { MapSettingsIcon } from './styles';

interface ISettingsButton {
  onClick: () => void;
}

export const SettingsButton: React.FC<ISettingsButton> = ({ onClick }) => (
  <HTMLOverlay
    style={{ pointerEvents: 'none' }}
    captureDrag
    redraw={() => <MapSettingsIcon onClick={onClick} />}
  />
);
