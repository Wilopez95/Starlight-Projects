import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Materials } from './Materials';
import { MiscellaneousItems } from './Miscellaneous';

export const MaterialsAndMiscellaneous: React.FC = () => {
  return (
    <Layouts.Grid columns={2} gap="4">
      <Layouts.Cell width={1}>
        <Materials />
      </Layouts.Cell>
      <Layouts.Cell width={1}>
        <MiscellaneousItems />
      </Layouts.Cell>
    </Layouts.Grid>
  );
};
