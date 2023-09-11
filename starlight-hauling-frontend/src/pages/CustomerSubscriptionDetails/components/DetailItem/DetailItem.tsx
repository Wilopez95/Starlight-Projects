import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';

import { type IDetailItem } from './types';

const DetailItem: React.FC<IDetailItem> = ({
  label,
  textTransform,
  width = '220px',
  children = null,
  color = 'secondary',
  shade = 'desaturated',
}) => (
  <Layouts.Flex as={Layouts.Margin} top="2" justifyContent="flex-start" alignItems="flex-start">
    <Layouts.Box minWidth={width} maxWidth={width}>
      <Typography
        as={Layouts.Padding}
        color={color}
        shade={shade}
        right="2"
        variant="bodyMedium"
        textTransform={textTransform}
      >
        {label}
      </Typography>
    </Layouts.Box>
    {children}
  </Layouts.Flex>
);

export default observer(DetailItem);
