import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { Badge, Typography } from '@root/common';

import { IOrderHistoryCreatedMediaFileChanges } from './types';

export const OrderHistoryCreatedMediaFileChanges: React.FC<
  IOrderHistoryCreatedMediaFileChanges
> = ({ amount }) => {
  return (
    <Layouts.Flex alignItems="center" $wrap>
      <Layouts.Margin right="1">
        <Badge color="secondary" shade="dark" bgColor="grey" bgShade="light">
          {amount}
        </Badge>
      </Layouts.Margin>
      <Layouts.Margin right="0.5">
        <Typography fontWeight="bold">Media files</Typography>
      </Layouts.Margin>
      added
    </Layouts.Flex>
  );
};
