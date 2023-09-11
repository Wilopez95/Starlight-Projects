import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { MapBoundsProvider } from '@root/providers/MapBoundsProvider';
import { MasterRoutesMapProvider } from '@root/providers/MasterRoutesMapProvider';

import { ITabProps } from '../types';

import { MasterRouteController } from './common/MasterRouteActions/MasterRouteActions';
import { ListSection } from './ListSection';
import { MapSection } from './MapSection';

export const MasterRouter: React.FC<ITabProps> = ({ tableNavigationRef }) => {
  return (
    <Layouts.Flex flexGrow={1}>
      <MasterRoutesMapProvider>
        <MapBoundsProvider>
          <MapSection />

          <MasterRouteController>
            <ListSection tableNavigationRef={tableNavigationRef} />
          </MasterRouteController>
        </MapBoundsProvider>
      </MasterRoutesMapProvider>
    </Layouts.Flex>
  );
};
