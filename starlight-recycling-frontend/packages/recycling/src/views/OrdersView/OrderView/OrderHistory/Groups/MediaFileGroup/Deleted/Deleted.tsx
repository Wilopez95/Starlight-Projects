import React from 'react';

import { Typography, Box } from '@material-ui/core';

import { IOrderHistoryDeletedMediaFileChanges } from './types';

export const OrderHistoryDeletedMediaFileChanges: React.FC<IOrderHistoryDeletedMediaFileChanges> = ({
  amount,
}) => {
  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      <Box mr="1">
        {amount}
        {/* <Badge color='secondary' shade='desaturated' bgColor='grey' bgShade='light'>
          {amount}
        </Badge> */}
      </Box>
      <Box mr="0.5">
        {/* Bold */}
        <Typography>Media files</Typography>
      </Box>
      deleted
    </Box>
  );
};
