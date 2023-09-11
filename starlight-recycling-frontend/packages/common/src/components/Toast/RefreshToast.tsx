import React, { FC, ReactNode } from 'react';

import { Box, CircularProgress, createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(() =>
  createStyles<string, {}>({
    spinner: {
      display: 'flex',
    },
  }),
);

interface RefreshToastProps {
  message: ReactNode;
}

export const RefreshToast: FC<RefreshToastProps> = ({ message }) => {
  const classes = useStyles();

  return (
    <Box display="flex" alignItems="center">
      <Box marginRight={1}>
        <CircularProgress classes={{ root: classes.spinner }} size={20} />
      </Box>
      {message}
    </Box>
  );
};
