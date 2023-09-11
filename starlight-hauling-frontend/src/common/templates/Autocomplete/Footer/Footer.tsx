import React from 'react';
import { Layouts } from '@starlightpro/shared-components';

import { PlusIcon } from '@root/assets';
import { Typography } from '@root/common/Typography/Typography';

import { IFooterTemplate } from './types';

export const Footer: React.FC<IFooterTemplate> = ({ text }) => (
  <Layouts.Padding top="1" bottom="1">
    <Layouts.Flex alignItems="center">
      <Typography variant="bodyMedium" cursor="pointer" color="information">
        <Layouts.IconLayout width="12px" height="12px">
          <PlusIcon />
        </Layouts.IconLayout>
        {text}
      </Typography>
    </Layouts.Flex>
  </Layouts.Padding>
);
