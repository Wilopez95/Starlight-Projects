import React from 'react';

import { Box, Typography, Chip, makeStyles } from '@material-ui/core';

import { IOrderHistoryCreatedMediaFileChanges } from './types';

const useStyles = makeStyles(() => ({
  mediaStyles: {
    fontWeight: 'bold',
  },
}));

export const OrderHistoryCreatedMediaFileChanges: React.FC<IOrderHistoryCreatedMediaFileChanges> = ({
  amount,
}) => {
  const classes = useStyles();

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap">
      <Box mr={2}>
        <Chip label={amount} />
      </Box>
      <Box mr={1}>
        <Typography className={classes.mediaStyles} variant="caption">
          Media files
        </Typography>
      </Box>
      <Typography variant="caption">added</Typography>
    </Box>
  );
};
