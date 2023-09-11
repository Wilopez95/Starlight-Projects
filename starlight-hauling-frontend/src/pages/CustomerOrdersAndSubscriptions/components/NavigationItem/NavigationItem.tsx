import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';

const NavigationItem: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <Layouts.Box width="100%">
    <Typography variant="headerFive">{title}</Typography>
    <Typography variant="bodyMedium" color="secondary" shade="desaturated">
      {subtitle}
    </Typography>
  </Layouts.Box>
);

export default observer(NavigationItem);
