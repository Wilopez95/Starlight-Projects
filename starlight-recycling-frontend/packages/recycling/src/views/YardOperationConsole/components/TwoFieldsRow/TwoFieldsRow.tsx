import { Box, makeStyles } from '@material-ui/core';
import React, { FC, ReactNode } from 'react';

export interface TwoFieldsRowProps {
  children: ReactNode[];
}

const useStyles = makeStyles(
  ({ spacing }) => ({
    fieldsRow: {
      display: 'flex',
      marginBottom: spacing(1),
      '& > $splitRowItem:first-child': {
        paddingLeft: 0,
      },
      '& > $splitRowItem:last-child': {
        paddingRight: 0,
      },
    },
    fieldsRowItem: {
      padding: spacing(0, 2),
      flexGrow: 1,
      flexBasis: 0,

      '&:first-child': {
        paddingLeft: 0,
      },
      '&:last-child': {
        paddingRight: 0,
      },
    },
  }),
  { name: 'TwoFieldsRow' },
);

export const TwoFieldsRow: FC<TwoFieldsRowProps> = ({ children }) => {
  const classes = useStyles();

  return (
    <Box className={classes.fieldsRow}>
      <Box className={classes.fieldsRowItem}>{children[0]}</Box>
      <Box className={classes.fieldsRowItem}>{children[1]}</Box>
    </Box>
  );
};
