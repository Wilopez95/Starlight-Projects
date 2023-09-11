import React from 'react';
import { Layouts, Loadable } from '@starlightpro/shared-components';

const containerHeight = 50;

export const HistoryGroupSkeleton: React.FC = () => (
  <Layouts.Margin bottom="2">
    <Layouts.Margin bottom="0.5">
      <Layouts.Flex alignItems="center">
        <Loadable width="10ch" />・<Loadable width="25ch" />
      </Layouts.Flex>
    </Layouts.Margin>
    <Loadable width="100%" height={containerHeight} tag="div" />
  </Layouts.Margin>
);
