import { useMemo } from 'react';

import { ItemsToShow } from '@root/providers/MapSettingsProvider/types';
import { IWayPoint } from '@root/types';

const useWayPointsFilteredBySettings = (waypoints: IWayPoint[], mapSettings: ItemsToShow) =>
  useMemo(() => waypoints.filter(wp => !!mapSettings[wp.type]), [waypoints, mapSettings]);

export { useWayPointsFilteredBySettings };
