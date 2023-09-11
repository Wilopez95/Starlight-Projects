import React from 'react';
import { Layouts, Typography } from '@starlightpro/shared-components';

import { ILogo } from '@root/core/common/Logo/types';

export const Logo: React.FC<ILogo> = ({ defaultLogo, image, updatedAt, icon }) =>
  icon ? (
    <Layouts.Box
      as={Layouts.Margin}
      right='2'
      position='relative'
      top='30%'
      left='30%'
      width='40px'
      height='40px'
      backgroundColor='primary'
      borderRadius='4px'
    >
      {icon}
    </Layouts.Box>
  ) : (
    <Layouts.Margin right='2'>
      <Layouts.Box
        as={Layouts.Flex}
        justifyContent='center'
        width='40px'
        height='40px'
        backgroundColor='primary'
        borderRadius='4px'
      >
        {image ? (
          <img src={`${image}${updatedAt ? `?modified=${updatedAt.valueOf()}` : ''}`} />
        ) : (
          <Layouts.Box position='relative' top='25%'>
            <Typography variant='bodyLarge' color='white' fontWeight='bold'>
              {defaultLogo}
            </Typography>
          </Layouts.Box>
        )}
      </Layouts.Box>
    </Layouts.Margin>
  );
