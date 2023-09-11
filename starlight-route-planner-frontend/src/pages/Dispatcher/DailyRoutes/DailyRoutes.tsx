import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { DailyRoutesMapProvider } from '@root/providers/DailyRoutesMapProvider';
import { MapBoundsProvider } from '@root/providers/MapBoundsProvider';

import { ITabProps } from '../types';

import { DailyRouteController } from './common/DailyRouteActions/DailyRouteActions';
import { ListSection } from './ListSection';
import { MapSection } from './MapSection';

export const DailyRoutes: React.FC<ITabProps> = ({ tableNavigationRef }) => {
  return (
    <Layouts.Flex flexGrow={1}>
      <DailyRoutesMapProvider>
        <MapBoundsProvider>
          <MapSection />

          <DailyRouteController>
            <ListSection tableNavigationRef={tableNavigationRef} />
          </DailyRouteController>
        </MapBoundsProvider>
      </DailyRoutesMapProvider>
    </Layouts.Flex>
  );
};
