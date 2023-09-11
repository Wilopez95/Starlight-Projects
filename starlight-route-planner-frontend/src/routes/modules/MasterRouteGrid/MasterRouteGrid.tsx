import { Layouts } from '@starlightpro/shared-components';
import React from 'react';
import GridSection from '../../../pages/MasterRouteGrid/gridSection/GridSection';

export const MasterRouteGridModuleRoutes: React.FC = () => {
  return (
    <Layouts.Flex flexGrow={1}>
      <GridSection />
    </Layouts.Flex>
  );
};
