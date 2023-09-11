import React from 'react';
import { Layouts } from '@starlightpro/shared-components';
import { observer } from 'mobx-react-lite';

import { Typography } from '@root/common';

import { type IDetailColumnItem } from './types';

const DetailColumnItem: React.FC<IDetailColumnItem> = ({
  label,
  children = null,
  textTransform,
  width = 'auto',
  textAlign = 'left',
  variant = 'bodyMedium',
}) => (
  <Layouts.Box width={width}>
    <Layouts.Margin as={Layouts.Flex} top="2" direction="column" alignItems={textAlign}>
      {label ? (
        <Typography
          as={Layouts.Margin}
          bottom="2"
          color="secondary"
          shade="desaturated"
          variant={variant}
          textAlign={textAlign}
          textTransform={textTransform}
        >
          {label}
        </Typography>
      ) : null}
      {children}
    </Layouts.Margin>
  </Layouts.Box>
);

export default observer(DetailColumnItem);
