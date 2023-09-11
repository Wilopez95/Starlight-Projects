import * as React from 'react';
import { Box, Flex, Margin, Typography } from '@starlightpro/shared-components';

import { ILogo } from './types';

export const Logo: React.FC<ILogo> = ({
  defaultLogo,
  image,
  updatedAt,
  icon,
}) =>
  icon ? (
    <Box
      as={Margin}
      right="2"
      position="relative"
      top="30%"
      // left='30%'
      width="40px"
      height="40px"
      backgroundColor="primary"
      borderRadius="4px"
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        style={{ height: '100%' }}
      >
        {icon}
      </Flex>
    </Box>
  ) : (
    <Margin right="1">
      <Box
        as={Flex}
        justifyContent="center"
        width="40px"
        height="40px"
        backgroundColor="primary"
        borderRadius="4px"
      >
        {image ? (
          <img
            src={`${image}${
              updatedAt ? `?modified=${updatedAt.valueOf()}` : ''
            }`}
            style={{ width: '100%', borderRadius: '4px' }}
          />
        ) : (
          <Box position="relative" top="25%">
            <Typography variant="bodyLarge" color="white" fontWeight="bold">
              {defaultLogo}
            </Typography>
          </Box>
        )}
      </Box>
    </Margin>
  );
